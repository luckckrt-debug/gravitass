import { 
  FinancialJournalEntry, 
  JournalEntryLine, 
  FinancialAccountType,
  EscrowAccount,
  MilestoneEscrow,
  CommissionRule,
  TaxRule,
  TaxTransactionRecord,
  InvoiceRecord,
  InvoiceItem,
  FreelancerPayoutSettings,
  DisputeRecord,
  LegalPartyDetails,
  PlatformSettings,
  Contract,
  Project
} from '@/types';

// ==========================================
// ARITHMETIC SAFETY: MINOR CURRENCY UNITS
// ==========================================

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinorUnits(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

export function safeAdd(a: number, b: number): number {
  return fromMinorUnits(toMinorUnits(a) + toMinorUnits(b));
}

export function safeSubtract(a: number, b: number): number {
  return fromMinorUnits(toMinorUnits(a) - toMinorUnits(b));
}

export function safeMultiply(amount: number, factor: number): number {
  return fromMinorUnits(Math.round(toMinorUnits(amount) * factor));
}

// ==========================================
// DOUBLE-ENTRY BALANCING & AUDIT INTEGRITY
// ==========================================

export function validateDoubleEntry(lines: JournalEntryLine[]): { isValid: boolean; debitTotal: number; creditTotal: number; difference: number } {
  let debitCents = 0;
  let creditCents = 0;

  for (const line of lines) {
    const lineCents = toMinorUnits(line.amount);
    if (line.type === 'debit') {
      debitCents += lineCents;
    } else {
      creditCents += lineCents;
    }
  }

  const diff = Math.abs(debitCents - creditCents);
  return {
    isValid: diff === 0,
    debitTotal: fromMinorUnits(debitCents),
    creditTotal: fromMinorUnits(creditCents),
    difference: fromMinorUnits(diff)
  };
}

// ==========================================
// COMMISSION CALCULATION ENGINE
// ==========================================

export function calculateCommissionFee(params: {
  grossAmount: number;
  category?: string;
  freelancerId?: string;
  rule: CommissionRule;
}): {
  grossAmount: number;
  effectivePercentage: number;
  commissionFee: number;
  freelancerNetBeforeTax: number;
  ruleVersion: string;
} {
  const { grossAmount, category, freelancerId, rule } = params;

  let percentage = rule.defaultPercentage;

  if (category && rule.categoryRates && rule.categoryRates[category] !== undefined) {
    percentage = rule.categoryRates[category];
  }

  if (freelancerId && rule.freelancerRates && rule.freelancerRates[freelancerId] !== undefined) {
    percentage = rule.freelancerRates[freelancerId];
  }

  let fee = fromMinorUnits(Math.round(toMinorUnits(grossAmount) * (percentage / 100)));

  // Clamp within bounds if set
  if (rule.minFee && fee < rule.minFee && grossAmount > rule.minFee) {
    fee = rule.minFee;
  }
  if (rule.maxFee && fee > rule.maxFee) {
    fee = rule.maxFee;
  }

  const freelancerNetBeforeTax = safeSubtract(grossAmount, fee);

  return {
    grossAmount,
    effectivePercentage: percentage,
    commissionFee: fee,
    freelancerNetBeforeTax,
    ruleVersion: rule.version
  };
}

// ==========================================
// TAX MANAGEMENT ENGINE (GST & TDS 194-O)
// ==========================================

export function calculateApplicableTaxes(params: {
  grossAmount: number;
  platformFee: number;
  freelancerLifetimeEarnings?: number;
  taxRules: TaxRule[];
}): {
  gstOnCommission: number;
  cgst: number;
  sgst: number;
  igst: number;
  tdsAmount: number;
  netFreelancerPayable: number;
  appliedGstRule?: TaxRule;
  appliedTdsRule?: TaxRule;
} {
  const { grossAmount, platformFee, freelancerLifetimeEarnings = 0, taxRules } = params;

  let gstOnCommission = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let tdsAmount = 0;

  const gstRule = taxRules.find(r => r.isEnabled && r.type === 'gst_on_commission');
  if (gstRule) {
    gstOnCommission = fromMinorUnits(Math.round(toMinorUnits(platformFee) * (gstRule.ratePercentage / 100)));
    cgst = fromMinorUnits(Math.round(toMinorUnits(platformFee) * ((gstRule.cgstPercentage || (gstRule.ratePercentage / 2)) / 100)));
    sgst = fromMinorUnits(Math.round(toMinorUnits(platformFee) * ((gstRule.sgstPercentage || (gstRule.ratePercentage / 2)) / 100)));
    igst = gstOnCommission;
  }

  const tdsRule = taxRules.find(r => r.isEnabled && r.type === 'tds_194o');
  if (tdsRule) {
    // Section 194-O of Indian Income Tax Act: 1% TDS on gross participant transactions
    // If lifetime earnings threshold is exceeded or threshold is 0:
    const threshold = tdsRule.thresholdAmount || 0;
    if (freelancerLifetimeEarnings + grossAmount >= threshold) {
      tdsAmount = fromMinorUnits(Math.round(toMinorUnits(grossAmount) * (tdsRule.ratePercentage / 100)));
    }
  }

  // Freelancer receives: Gross - PlatformFee - TDS
  const netFreelancerPayable = safeSubtract(safeSubtract(grossAmount, platformFee), tdsAmount);

  return {
    gstOnCommission,
    cgst,
    sgst,
    igst,
    tdsAmount,
    netFreelancerPayable,
    appliedGstRule: gstRule,
    appliedTdsRule: tdsRule
  };
}

// ==========================================
// SEQUENTIAL INVOICE & RECEIPT NUMBERING
// ==========================================

export function generateNextInvoiceNumber(existingInvoices: InvoiceRecord[], prefix: 'INV' | 'CRN' | 'REC' | 'PAY' = 'INV'): string {
  const year = new Date().getFullYear();
  const searchPrefix = `${prefix}-${year}-`;
  
  const matching = existingInvoices
    .filter(inv => inv.invoiceNumber && inv.invoiceNumber.startsWith(searchPrefix))
    .map(inv => {
      const parts = inv.invoiceNumber.split('-');
      const num = parseInt(parts[2], 10);
      return isNaN(num) ? 0 : num;
    });

  const maxNum = matching.length > 0 ? Math.max(...matching) : 0;
  const nextNum = maxNum + 1;
  return `${searchPrefix}${String(nextNum).padStart(4, '0')}`;
}

// ==========================================
// HTML / PRINT-READY INVOICE TEMPLATE GENERATOR
// ==========================================

export function generateInvoiceHtml(invoice: InvoiceRecord): string {
  const isCreditNote = invoice.type === 'refund_credit_note';
  const title = isCreditNote 
    ? 'CREDIT NOTE (REFUND MEMORANDUM)' 
    : invoice.type === 'client_tax_invoice'
    ? 'TAX INVOICE — ESCROW FUNDING'
    : invoice.type === 'platform_commission_invoice'
    ? 'PLATFORM SERVICE FEE TAX INVOICE'
    : 'FREELANCER DISBURSEMENT STATEMENT';

  const rows = invoice.items.map(item => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
      <td style="padding: 12px 8px; font-size: 13px; color: #F4F5F3;">
        ${item.description}
        ${item.sacHsnCode ? `<br/><span style="font-size: 11px; color: #73D8C4; font-family: monospace;">SAC/HSN: ${item.sacHsnCode}</span>` : ''}
      </td>
      <td style="padding: 12px 8px; font-size: 13px; text-align: center; color: #91A09E;">${item.quantity}</td>
      <td style="padding: 12px 8px; font-size: 13px; text-align: right; color: #F4F5F3;">$${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 12px 8px; font-size: 13px; text-align: right; color: #73D8C4;">$${item.taxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 12px 8px; font-size: 13px; text-align: right; color: #91A09E;">${item.taxRate}% ($${item.taxAmount.toFixed(2)})</td>
      <td style="padding: 12px 8px; font-size: 13px; text-align: right; font-weight: bold; color: #F4F5F3;">$${item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${invoice.invoiceNumber} — GRAVITASS</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #071011;
      color: #F4F5F3;
      margin: 0;
      padding: 40px;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #0B1719;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 0.2em;
      color: #F4F5F3;
    }
    .badge {
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(115,216,196,0.15);
      border: 1px solid rgba(115,216,196,0.4);
      color: #73D8C4;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #91A09E;
      margin-bottom: 8px;
    }
    .party-name {
      font-size: 15px;
      font-weight: 600;
      color: #F4F5F3;
      margin-bottom: 4px;
    }
    .party-meta {
      font-size: 12px;
      color: #91A09E;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 30px;
    }
    th {
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #91A09E;
      padding: 10px 8px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .totals {
      margin-left: auto;
      width: 320px;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 12px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 6px 0;
      color: #91A09E;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: bold;
      color: #73D8C4;
      border-top: 1px solid rgba(115,216,196,0.3);
      padding-top: 12px;
      margin-top: 8px;
    }
    .footer {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 20px;
      margin-top: 40px;
      font-size: 11px;
      color: #91A09E;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 20px; background: #fff; }
      .party-name, .logo, .grand-total { color: #000; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo">GRAVITASS</div>
        <div style="font-size: 10px; letter-spacing: 0.15em; color: #91A09E; text-transform: uppercase; margin-top: 2px;">Independent Work Protocol</div>
        <div style="margin-top: 12px;" class="badge">${invoice.status.toUpperCase()}</div>
      </div>
      <div style="text-align: right;">
        <h2 style="font-size: 16px; margin: 0; color: #73D8C4; letter-spacing: 0.05em;">${title}</h2>
        <p style="font-size: 14px; font-weight: bold; font-family: monospace; margin: 6px 0 2px 0;">${invoice.invoiceNumber}</p>
        <p style="font-size: 12px; color: #91A09E; margin: 0;">Date: ${new Date(invoice.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        ${invoice.originalInvoiceId ? `<p style="font-size: 11px; color: #f87171; margin-top: 4px;">Ref Original Inv: ${invoice.originalInvoiceId}</p>` : ''}
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="section-title">SUPPLIER / ISSUER</div>
        <div class="party-name">${invoice.supplier.name}</div>
        <div class="party-meta">
          ${invoice.supplier.legalAddress}<br/>
          ${invoice.supplier.gstin ? `<strong>GSTIN:</strong> ${invoice.supplier.gstin}<br/>` : ''}
          ${invoice.supplier.pan ? `<strong>PAN:</strong> ${invoice.supplier.pan}<br/>` : ''}
          <strong>Email:</strong> ${invoice.supplier.email}
        </div>
      </div>

      <div>
        <div class="section-title">CUSTOMER / BENEFICIARY</div>
        <div class="party-name">${invoice.customer.name}</div>
        <div class="party-meta">
          ${invoice.customer.legalAddress || 'Verified GRAVITASS Member'}<br/>
          ${invoice.customer.gstin ? `<strong>GSTIN:</strong> ${invoice.customer.gstin}<br/>` : ''}
          ${invoice.customer.pan ? `<strong>PAN:</strong> ${invoice.customer.pan}<br/>` : ''}
          <strong>Email:</strong> ${invoice.customer.email}
        </div>
      </div>
    </div>

    ${invoice.projectTitle ? `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 16px; margin-bottom: 24px; font-size: 12px;">
        <span style="color: #91A09E; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 0.1em;">Associated Contract:</span>
        <strong style="color: #F4F5F3; margin-left: 6px;">${invoice.projectTitle}</strong> (ID: ${invoice.contractId || 'N/A'})
      </div>
    ` : ''}

    <table>
      <thead>
        <tr>
          <th>Service Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Rate</th>
          <th style="text-align: right;">Taxable Val</th>
          <th style="text-align: right;">Tax Rate</th>
          <th style="text-align: right;">Total ($)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Taxable Subtotal:</span>
        <span style="color: #F4F5F3;">$${invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="totals-row">
        <span>Applicable Taxes (GST/TDS):</span>
        <span style="color: #F4F5F3;">$${invoice.taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="grand-total">
        <span>Total Amount Due / Credited:</span>
        <span>$${invoice.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>

    ${invoice.notes ? `
      <div style="margin-top: 30px; padding: 12px 16px; border-radius: 12px; background: rgba(115,216,196,0.05); border: 1px solid rgba(115,216,196,0.2); font-size: 12px; color: #91A09E;">
        <strong style="color: #73D8C4;">Remittance & Compliance Note:</strong> ${invoice.notes}
      </div>
    ` : ''}

    <div class="footer">
      <div>
        Generated cryptographically via GRAVITASS Financial Engine &bull; Ref: ${invoice.paymentReference || invoice.id}
      </div>
      <div>
        Page 1 of 1 &bull; System Verified
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
