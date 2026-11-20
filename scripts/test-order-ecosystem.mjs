import http from 'http';

const BASE = 'http://localhost:3000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING GRAVITASS COMPLETE ORDER & FINTECH SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Fetch Freelancer Orders
    console.log('1. Testing GET /api/orders for Freelancer:');
    const ordersRes = await request('GET', '/api/orders?userId=user-freelancer-1&role=freelancer');
    assert(ordersRes.status === 200, 'Orders endpoint returned 200 OK');
    assert(Array.isArray(ordersRes.data.orders), 'Returned orders is an array');
    assert(ordersRes.data.total >= 3, `Freelancer has ${ordersRes.data.total} orders`);
    console.log(`   Tabs: New=${ordersRes.data.counts?.new}, Active=${ordersRes.data.counts?.active}, Submitted=${ordersRes.data.counts?.submitted}, Completed=${ordersRes.data.counts?.completed}`);

    // 2. Create New Order (Client hires Freelancer)
    console.log('\n2. Testing POST /api/orders (Client Order Creation):');
    const newOrderPayload = {
      clientId: 'user-client-1',
      clientName: 'Aetheria Labs',
      clientCompany: 'Aetheria Labs Inc.',
      freelancerId: 'user-freelancer-1',
      freelancerName: 'Elena Vance',
      projectTitle: 'Automated Micro-Settlement Payment Protocol Engine',
      projectDescription: 'High-speed event-driven micro-settlement service with zero floating point drift and double-entry auditing.',
      agreedPriceINR: 150000,
      deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      deliverables: ['Go microservice binary', 'Kubernetes Helm Chart', 'Load test benchmark report']
    };
    const createRes = await request('POST', '/api/orders', newOrderPayload);
    assert(createRes.status === 201, 'Order created successfully with status 201');
    assert(createRes.data.order?.id.startsWith('ORD-'), `Generated order ID: ${createRes.data.order?.id}`);
    assert(createRes.data.order?.platformFeeINR === 15000, `Platform fee is 10% (₹15,000): got ₹${createRes.data.order?.platformFeeINR}`);
    assert(createRes.data.order?.netFreelancerEntitlementINR === 135000, `Net entitlement is ₹135,000: got ₹${createRes.data.order?.netFreelancerEntitlementINR}`);
    const createdOrderId = createRes.data.order?.id;

    // 3. Freelancer Accepts Order
    console.log('\n3. Testing PATCH /api/orders/[id] (Accept Order):');
    const acceptRes = await request('PATCH', `/api/orders/${createdOrderId}`, {
      action: 'accept',
      userId: 'user-freelancer-1'
    });
    assert(acceptRes.status === 200, 'Order accepted successfully');
    assert(acceptRes.data.order?.status === 'in_progress', `Order status is 'in_progress': got ${acceptRes.data.order?.status}`);

    // 4. Update Workspace Progress
    console.log('\n4. Testing PATCH /api/orders/[id] (Update Progress & Notes):');
    const progressRes = await request('PATCH', `/api/orders/${createdOrderId}`, {
      action: 'update_progress',
      userId: 'user-freelancer-1',
      progressPercentage: 75,
      workNotes: 'Core Kafka subscriber and settlement state machine implemented. Running load tests.'
    });
    assert(progressRes.status === 200, 'Progress updated successfully');
    assert(progressRes.data.order?.progressPercentage === 75, `Progress is 75%: got ${progressRes.data.order?.progressPercentage}%`);

    // 5. Submit Work Deliverable (Version 1)
    console.log('\n5. Testing POST /api/orders/[id]/submit (Version 1 Deliverable):');
    const submitV1Res = await request('POST', `/api/orders/${createdOrderId}/submit`, {
      freelancerId: 'user-freelancer-1',
      description: 'Initial implementation of micro-settlement service with unit test suite.',
      files: [
        { name: 'settlement_engine_v1.zip', url: 'https://gravitass.work/deliverables/settlement_engine_v1.zip', size: 12500000, type: 'application/zip' }
      ]
    });
    assert(submitV1Res.status === 201, 'Deliverable v1 submitted successfully');
    assert(submitV1Res.data.order?.status === 'submitted', `Order status updated to 'submitted'`);
    assert(submitV1Res.data.submission?.version === 1, `Submission version is 1`);

    // 6. Client Requests Revision
    console.log('\n6. Testing POST /api/orders/[id]/review (Client Revision Request):');
    const revRes = await request('POST', `/api/orders/${createdOrderId}/review`, {
      action: 'request_revision',
      userId: 'user-client-1',
      reason: 'Please add Prometheus metrics for p99 latency evaluation under burst loads.'
    });
    assert(revRes.status === 200, 'Revision request logged successfully');
    assert(revRes.data.order?.status === 'revision_requested', `Order status updated to 'revision_requested'`);

    // 7. Freelancer Resubmits Work (Version 2)
    console.log('\n7. Testing POST /api/orders/[id]/submit (Version 2 Resubmission):');
    const submitV2Res = await request('POST', `/api/orders/${createdOrderId}/submit`, {
      freelancerId: 'user-freelancer-1',
      description: 'Added Prometheus /metrics exporter with p50, p90, p99 histogram buckets and Grafana dashboard config.',
      files: [
        { name: 'settlement_engine_v2_metrics.zip', url: 'https://gravitass.work/deliverables/settlement_engine_v2_metrics.zip', size: 13200000, type: 'application/zip' },
        { name: 'p99_latency_benchmark.pdf', url: 'https://gravitass.work/deliverables/p99_latency_benchmark.pdf', size: 850000, type: 'application/pdf' }
      ]
    });
    assert(submitV2Res.status === 201, 'Deliverable v2 submitted successfully');
    assert(submitV2Res.data.submission?.version === 2, `Submission version incremented to 2`);

    // 8. Client Approves Work Deliverable & Releases Funds
    console.log('\n8. Testing POST /api/orders/[id]/review (Client Approval & Automatic Credit):');
    const approveRes = await request('POST', `/api/orders/${createdOrderId}/review`, {
      action: 'approve',
      userId: 'user-client-1'
    });
    assert(approveRes.status === 200, 'Deliverables approved successfully');
    assert(approveRes.data.order?.status === 'completed', `Order status transitioned to 'completed'`);
    assert(approveRes.data.commissionEntry !== undefined, 'Admin commission entry automatically recognized');
    assert(approveRes.data.commissionEntry?.commissionAmountINR === 15000, `Recognized commission is ₹15,000: got ₹${approveRes.data.commissionEntry?.commissionAmountINR}`);

    // 9. Bank Accounts & UPI Management
    console.log('\n9. Testing /api/finance/bank-accounts:');
    const bankListRes = await request('GET', '/api/finance/bank-accounts?freelancerId=user-freelancer-1');
    assert(bankListRes.status === 200, 'Bank accounts list retrieved');
    assert(bankListRes.data.bankAccounts?.length >= 1, `Found ${bankListRes.data.bankAccounts?.length} verified bank accounts`);

    // Add new Bank Account
    const addBankRes = await request('POST', '/api/finance/bank-accounts', {
      freelancerId: 'user-freelancer-1',
      type: 'bank',
      accountHolderName: 'Elena Vance',
      accountNumber: '918284719284',
      ifsc: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountType: 'savings'
    });
    assert(addBankRes.status === 201, 'New Indian bank account added and verified');
    assert(addBankRes.data.bankAccount?.maskedAccountNumber === '•••• •••• 9284', `Account number correctly masked: ${addBankRes.data.bankAccount?.maskedAccountNumber}`);

    // Add new UPI ID
    const addUpiRes = await request('POST', '/api/finance/bank-accounts', {
      freelancerId: 'user-freelancer-1',
      type: 'upi',
      upiId: 'elena.vance@icici'
    });
    assert(addUpiRes.status === 201, 'New UPI handle registered and verified');
    assert(addUpiRes.data.upiAccount?.maskedUpi.startsWith('ele***@'), `UPI handle correctly masked: ${addUpiRes.data.upiAccount?.maskedUpi}`);

    // 10. Execute Instant Freelancer Withdrawal
    console.log('\n10. Testing POST /api/finance/withdraw-instant:');
    const verifiedBankId = bankListRes.data.bankAccounts[0].id;
    const withdrawRes = await request('POST', '/api/finance/withdraw-instant', {
      freelancerId: 'user-freelancer-1',
      amountINR: 10000,
      destinationId: verifiedBankId,
      method: 'bank'
    });
    assert(withdrawRes.status === 200, 'Instant withdrawal processed successfully');
    assert(withdrawRes.data.withdrawal?.status === 'paid', `Withdrawal status is 'paid': got ${withdrawRes.data.withdrawal?.status}`);
    assert(withdrawRes.data.withdrawal?.paymentReference !== undefined, `Gateway Reference generated: ${withdrawRes.data.withdrawal?.paymentReference}`);

    // 11. Admin Commission Summary & Ledger
    console.log('\n11. Testing GET /api/admin/commission/withdraw:');
    const adminFinanceRes = await request('GET', '/api/admin/commission/withdraw');
    assert(adminFinanceRes.status === 200, 'Admin commission finance endpoint returned 200 OK');
    assert(adminFinanceRes.data.summary?.totalRecognizedRevenue > 0, `Total recognized platform revenue: ₹${adminFinanceRes.data.summary?.totalRecognizedRevenue.toLocaleString('en-IN')}`);
    assert(adminFinanceRes.data.summary?.availableCommissionBalance > 0, `Available corporate commission balance: ₹${adminFinanceRes.data.summary?.availableCommissionBalance.toLocaleString('en-IN')}`);
    assert(adminFinanceRes.data.bankAccounts?.length >= 1, `Admin corporate bank accounts registered: ${adminFinanceRes.data.bankAccounts?.length}`);

    // 12. Admin Corporate Commission Withdrawal
    console.log('\n12. Testing POST /api/admin/commission/withdraw:');
    const adminBankId = adminFinanceRes.data.bankAccounts[0].id;
    const adminWthRes = await request('POST', '/api/admin/commission/withdraw', {
      adminUserId: 'user-admin-1',
      amountINR: 10000,
      bankAccountId: adminBankId
    });
    assert(adminWthRes.status === 200, 'Admin corporate commission withdrawal executed');
    assert(adminWthRes.data.record?.status === 'paid', `Corporate withdrawal status: ${adminWthRes.data.record?.status}`);
    assert(adminWthRes.data.record?.bankAccount?.accountHolderName === 'GRAVITASS TECHNOLOGIES PRIVATE LIMITED', 'Disbursed to GRAVITASS corporate entity');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 FINTECH SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
