// Automated Verification Suite for GRAVITASS Super Admin Command Center
import http from 'http';

const BASE_URL = 'http://localhost:3000';
let adminCookie = '';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (adminCookie) {
      reqHeaders['Cookie'] = adminCookie;
    }

    const req = http.request(url, {
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('👑 GRAVITASS SUPER ADMIN COMMAND CENTER VERIFICATION');
  console.log('====================================================\n');

  // Step 1: Login as Admin to obtain session cookie
  console.log('--- Step 1: Admin Authentication ---');
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'admin@gravitass.com',
    password: 'password123'
  });
  assert(loginRes.status === 200, 'Admin login succeeds with 200 OK');
  assert(loginRes.data.user.role === 'admin', 'Authenticated session has role "admin"');
  
  const setCookie = loginRes.headers['set-cookie'];
  if (setCookie) {
    adminCookie = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  }
  assert(adminCookie.length > 0, 'Admin session cookie retrieved');

  // Step 2: Overview Analytics Telemetry (15 Required Metrics)
  console.log('\n--- Step 2: Super Admin Telemetry & 15 Metrics ---');
  const analyticsRes = await request('GET', '/api/admin/analytics');
  assert(analyticsRes.status === 200, 'GET /api/admin/analytics returns 200 OK');
  const a = analyticsRes.data.analytics;
  assert(a !== undefined, 'Analytics object exists');
  assert(typeof a.totalUsers === 'number' && a.totalUsers > 0, `Total registered users: ${a.totalUsers}`);
  assert(typeof a.totalFreelancers === 'number', `Total freelancers: ${a.totalFreelancers}`);
  assert(typeof a.totalClients === 'number', `Total clients: ${a.totalClients}`);
  assert(typeof a.verifiedFreelancers === 'number', `Verified freelancers: ${a.verifiedFreelancers}`);
  assert(typeof a.activeProjects === 'number', `Active projects: ${a.activeProjects}`);
  assert(typeof a.completedProjects === 'number', `Completed projects: ${a.completedProjects}`);
  assert(typeof a.pendingProjects === 'number', `Pending projects: ${a.pendingProjects}`);
  assert(typeof a.totalProjectVolume === 'number', `Total project payment volume (GMV): ₹${a.totalProjectVolume}`);
  assert(typeof a.totalCommissionRevenue === 'number', `Total commission revenue recognized: ₹${a.totalCommissionRevenue}`);
  assert(typeof a.pendingCommission === 'number', `Pending commission in escrow: ₹${a.pendingCommission}`);
  assert(typeof a.totalRefunds === 'number', `Total refunds: ₹${a.totalRefunds}`);
  assert(a.pendingWithdrawals && typeof a.pendingWithdrawals.count === 'number', `Pending withdrawals count: ${a.pendingWithdrawals.count}`);
  assert(a.successfulPayouts && typeof a.successfulPayouts.count === 'number', `Successful payouts count: ${a.successfulPayouts.count}`);
  assert(a.disputes && typeof a.disputes.total === 'number', `Total disputes: ${a.disputes.total}`);
  assert(Array.isArray(a.monthlyRevenue) && a.monthlyRevenue.length === 12, 'Monthly revenue breakdown array contains 12 months data');

  // Step 3: User Management & 6 Sub-Tabs
  console.log('\n--- Step 3: User Management (All 6 Sub-Tabs & Audit Dossier) ---');
  const usersRes = await request('GET', '/api/admin/users?tab=all');
  assert(usersRes.status === 200, 'GET /api/admin/users returns 200 OK');
  assert(usersRes.data.counts && usersRes.data.counts.all > 0, `All users count: ${usersRes.data.counts.all}`);
  assert(usersRes.data.counts.freelancers > 0, `Freelancers count: ${usersRes.data.counts.freelancers}`);
  assert(usersRes.data.counts.clients > 0, `Clients count: ${usersRes.data.counts.clients}`);
  assert(usersRes.data.counts.verified > 0, `Verified users count: ${usersRes.data.counts.verified}`);
  assert(usersRes.data.counts.pending >= 0, `Pending verification count: ${usersRes.data.counts.pending}`);
  assert(usersRes.data.counts.suspended >= 0, `Suspended users count: ${usersRes.data.counts.suspended}`);

  // Inspect full user audit dossier
  console.log('\n--- Step 4: User Audit Dossier & Sensitive Info Protection ---');
  const testUserId = 'user-freelancer-1';
  const dossierRes = await request('GET', `/api/admin/users?userId=${testUserId}`);
  assert(dossierRes.status === 200, `GET /api/admin/users?userId=${testUserId} returns 200 OK`);
  const dossier = dossierRes.data.auditDetails;
  assert(dossier.user && dossier.user.id === testUserId, 'Dossier returns correct user');
  assert(dossier.user.password === undefined, 'Sensitive field "password" is NOT exposed in admin response');
  assert(dossier.user.token === undefined, 'Sensitive field "token" is NOT exposed in admin response');
  assert(Array.isArray(dossier.projects), 'Dossier includes projects history array');
  assert(Array.isArray(dossier.ledger), 'Dossier includes ledger transactions history array');

  // User Suspension & Reactivation Test
  console.log('\n--- Step 5: User Suspension & Reactivation Flow ---');
  const suspendRes = await request('PATCH', '/api/admin/users', {
    userId: 'user-freelancer-2',
    action: 'suspend',
    reason: 'Test compliance suspension audit'
  });
  assert(suspendRes.status === 200, 'User suspension PATCH succeeds with 200 OK');
  assert(suspendRes.data.user.isSuspended === true, 'User isSuspended flag set to true');
  assert(suspendRes.data.user.suspensionReason === 'Test compliance suspension audit', 'Suspension reason correctly recorded');

  // Reactivate
  const reactivateRes = await request('PATCH', '/api/admin/users', {
    userId: 'user-freelancer-2',
    action: 'reactivate'
  });
  assert(reactivateRes.status === 200, 'User reactivation PATCH succeeds with 200 OK');
  assert(reactivateRes.data.user.isSuspended === false, 'User isSuspended flag restored to false');

  // Step 6: Dedicated Commission & Revenue Management Module
  console.log('\n--- Step 6: Commission & Revenue Management Engine ---');
  const commRes = await request('GET', '/api/admin/commission');
  assert(commRes.status === 200, 'GET /api/admin/commission returns 200 OK');
  assert(commRes.data.activeRule !== undefined, 'Active commission rule exists');
  assert(commRes.data.revenueSummary !== undefined, 'Revenue summary metrics exist');
  assert(typeof commRes.data.activeRule.defaultPercentage === 'number', `Default commission: ${commRes.data.activeRule.defaultPercentage}%`);
  assert(commRes.data.activeRule.categoryRates['programming-tech'] !== undefined, `Programming & Tech rate: ${commRes.data.activeRule.categoryRates['programming-tech']}%`);

  // Step 7: Live Commission Calculator Sandbox Simulation
  console.log('\n--- Step 7: Commission Live Calculator Sandbox Simulation ---');
  const calcRes = await request('GET', '/api/admin/commission?testAmount=10000&testCategory=programming-tech');
  assert(calcRes.status === 200, 'Simulation request returns 200 OK');
  const sim = calcRes.data.calculationSimulation;
  assert(sim !== null, 'Simulation result is calculated');
  assert(sim.grossAmount === 10000, 'Gross amount is ₹10,000');
  assert(sim.effectiveCommissionRate === 8, 'Programming & Tech rate 8% applied correctly');
  assert(sim.platformRevenue === 800, 'Platform revenue correctly computed as ₹800 (8% of ₹10,000)');
  assert(sim.freelancerEntitlement === 9200, 'Freelancer entitlement correctly computed as ₹9,200');
  assert(sim.gstOnPlatformFee === 144, 'GST (18% on ₹800 platform fee) = ₹144');
  assert(sim.tdsWithheld === 100, 'TDS 194-O (1% on ₹10,000 gross) = ₹100');
  assert(sim.netPayableToFreelancer === 9100, 'Net payable to talent = ₹9,100 (Entitlement ₹9,200 - TDS ₹100)');

  // Step 8: Promotional Commission Voucher Simulation
  console.log('\n--- Step 8: Promotional Commission Voucher Test ---');
  const promoRes = await request('GET', '/api/admin/commission?testAmount=10000&testCategory=programming-tech&testPromoCode=GRAVITASS2026');
  assert(promoRes.status === 200, 'Promo simulation request returns 200 OK');
  const promoSim = promoRes.data.calculationSimulation;
  assert(promoSim.promotionalApplied === true, 'Promotional discount voucher recognized');
  assert(promoSim.effectiveCommissionRate === 5, 'Promotional commission rate discounted to 5%');
  assert(promoSim.platformRevenue === 500, 'Platform revenue with promo = ₹500 (5% of ₹10,000)');

  console.log('\n====================================================');
  console.log('🎉 ALL 28 SUPER ADMIN VERIFICATION TESTS PASSED!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
