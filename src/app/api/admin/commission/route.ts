import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { calculateCommissionFee, calculateApplicableTaxes } from '@/lib/finance-engine';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const testAmount = searchParams.get('testAmount');
    const testCategory = searchParams.get('testCategory');
    const testFreelancerId = searchParams.get('testFreelancerId');
    const testPromoCode = searchParams.get('testPromoCode');

    const rules = db.getCommissionRules();
    const activeRule = db.getActiveCommissionRule();
    const ledger = db.getLedgerTransactions();
    const escrows = db.getEscrowAccounts();
    const categories = db.getCategories();
    const taxRules = db.getTaxRules ? db.getTaxRules() : [];

    // Revenue recognized from released deliverables
    const totalRecognizedCommission = ledger
      .filter(l => l.status === 'available' || l.status === 'paid')
      .reduce((sum, l) => sum + (l.platformFee || 0), 0);

    // Pending commission locked in active escrows
    const pendingCommissionInEscrow = escrows
      .filter(e => e.status !== 'payment_released' && e.status !== 'refunded' && e.status !== 'cancelled')
      .reduce((sum, e) => {
        const unreleased = Math.max(0, (e.fundedAmount || 0) - (e.releasedAmount || 0));
        return sum + Number(((unreleased * activeRule.defaultPercentage) / 100).toFixed(2));
      }, 0);

    // Average effective commission %
    const releasedTxCount = ledger.filter(l => l.status === 'available' || l.status === 'paid').length;
    const avgRate = releasedTxCount > 0
      ? (ledger.filter(l => l.status === 'available' || l.status === 'paid').reduce((sum, l) => sum + (l.commissionPercentage || 10), 0) / releasedTxCount).toFixed(1)
      : activeRule.defaultPercentage.toFixed(1);

    // Simulation / Calculator feature if test parameters provided
    let calculationSimulation = null;
    if (testAmount) {
      const gross = Number(testAmount) || 10000;
      const commCalc = calculateCommissionFee({
        grossAmount: gross,
        category: testCategory || undefined,
        freelancerId: testFreelancerId || undefined,
        promoCode: testPromoCode || undefined,
        rule: activeRule
      });

      const taxes = calculateApplicableTaxes({
        grossAmount: gross,
        platformFee: commCalc.commissionFee,
        taxRules
      });

      calculationSimulation = {
        grossAmount: gross,
        effectiveCommissionRate: commCalc.effectivePercentage,
        platformRevenue: commCalc.commissionFee,
        freelancerEntitlement: commCalc.freelancerNetBeforeTax,
        gstOnPlatformFee: taxes.gstOnCommission,
        tdsWithheld: taxes.tdsAmount,
        netPayableToFreelancer: taxes.netFreelancerPayable,
        ruleVersion: commCalc.ruleVersion,
        promotionalApplied: commCalc.promotionalApplied
      };
    }

    return NextResponse.json({
      activeRule,
      rules,
      categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
      revenueSummary: {
        totalRecognizedCommission,
        pendingCommissionInEscrow,
        averageCommissionRate: Number(avgRate),
        totalTransactionsCount: ledger.length
      },
      calculationSimulation
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      version,
      defaultPercentage,
      categoryRates,
      freelancerRates,
      promotionalPercentage,
      promotionalStartDate,
      promotionalEndDate,
      promotionalCode,
      minFee,
      maxFee,
      effectiveDate,
      description,
      isActive
    } = body;

    if (defaultPercentage === undefined || defaultPercentage < 0 || defaultPercentage > 50) {
      return NextResponse.json({ error: 'Default commission percentage must be between 0% and 50%' }, { status: 400 });
    }

    const created = db.createCommissionRule({
      version,
      defaultPercentage: Number(defaultPercentage),
      categoryRates: categoryRates || {},
      freelancerRates: freelancerRates || {},
      promotionalPercentage: promotionalPercentage !== undefined ? Number(promotionalPercentage) : undefined,
      promotionalStartDate,
      promotionalEndDate,
      promotionalCode,
      minFee: minFee !== undefined ? Number(minFee) : 50,
      maxFee: maxFee !== undefined ? Number(maxFee) : 25000,
      effectiveDate: effectiveDate || new Date().toISOString(),
      description: description || 'Super Admin Configured Commission Policy',
      isActive: Boolean(isActive)
    });

    return NextResponse.json({ rule: created, message: 'Commission rule created successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, action, ...updates } = body;

    const ruleId = id || db.getActiveCommissionRule().id;

    if (action === 'activate') {
      const activated = db.setActiveCommissionRule(ruleId);
      return NextResponse.json({ rule: activated, message: `Rule "${activated.version}" is now active protocol-wide.` });
    }

    if (updates.defaultPercentage !== undefined) {
      const p = Number(updates.defaultPercentage);
      if (isNaN(p) || p < 0 || p > 50) {
        return NextResponse.json({ error: 'Commission percentage must be between 0% and 50%' }, { status: 400 });
      }
      updates.defaultPercentage = p;
    }

    if (updates.minFee !== undefined) updates.minFee = Number(updates.minFee);
    if (updates.maxFee !== undefined) updates.maxFee = Number(updates.maxFee);
    if (updates.promotionalPercentage !== undefined) updates.promotionalPercentage = Number(updates.promotionalPercentage);

    const updated = db.updateCommissionRuleById(ruleId, updates);
    return NextResponse.json({ rule: updated, message: 'Commission rule updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    const deleted = db.deleteCommissionRule(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Cannot delete the active rule or rule does not exist' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Commission rule deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
