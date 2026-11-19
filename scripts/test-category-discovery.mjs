/**
 * Automated Verification Test Suite for GRAVITASS Category Navigation & Freelancer Discovery
 * Validates:
 * 1. All 13 Categories and Subcategory Taxonomies
 * 2. Search Suggestions Autocomplete API
 * 3. Multi-parameter Freelancer Discovery & INR Pricing Filter
 * 4. Slug Aliasing & Backwards Compatibility
 * 5. Admin Category Management CRUD
 */

import http from 'node:http';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: json, text: data });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 GRAVITASS DISCOVERY & TAXONOMY VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify 13 Core Categories
    console.log('--- Test Suite 1: 13 Core Service Categories ---');
    const catRes = await request('/api/categories');
    assert(catRes.status === 200, `GET /api/categories returns 200 (Got: ${catRes.status})`);
    assert(catRes.body?.categories?.length >= 13, `Categories count is at least 13 (Got: ${catRes.body?.categories?.length})`);

    const expectedSlugs = [
      'trending', 'graphics-design', 'programming-tech', 'digital-marketing',
      'video-animation', 'writing-translation', 'music-audio', 'business',
      'ai-services', 'data-analytics', 'engineering-architecture', 'photography', 'lifestyle-consulting'
    ];

    const actualSlugs = (catRes.body?.categories || []).map(c => c.slug);
    for (const slug of expectedSlugs) {
      assert(actualSlugs.includes(slug), `Category slug '${slug}' exists in response`);
    }

    // Check subcategory richness
    const progTech = (catRes.body?.categories || []).find(c => c.slug === 'programming-tech');
    assert(progTech?.subcategories?.length >= 10, `Programming & Tech has comprehensive subcategories (${progTech?.subcategories?.length})`);
    assert(progTech?.subcategories?.includes('Next.js Development'), `Programming & Tech includes 'Next.js Development'`);

    // 2. Slug Alias Mapping & Backward Compatibility
    console.log('\n--- Test Suite 2: Slug Aliases & Backward Compatibility ---');
    const aliasRes = await request('/api/categories/development');
    assert(aliasRes.status === 200, `GET /api/categories/development resolves via alias to 200`);
    assert(aliasRes.body?.category?.slug === 'programming-tech', `Legacy 'development' mapped to 'programming-tech'`);

    const aiAliasRes = await request('/api/categories/ai-automation');
    assert(aiAliasRes.status === 200, `GET /api/categories/ai-automation resolves via alias to 200`);
    assert(aiAliasRes.body?.category?.slug === 'ai-services', `Legacy 'ai-automation' mapped to 'ai-services'`);

    // 3. Search Suggestions Autocomplete API
    console.log('\n--- Test Suite 3: Search Suggestions Autocomplete API ---');
    const suggestEmptyRes = await request('/api/search/suggestions');
    assert(suggestEmptyRes.status === 200, `GET /api/search/suggestions returns 200 for empty query`);
    assert(suggestEmptyRes.body?.popularSearches?.length > 0, `Popular searches returned for empty query`);

    const suggestRes = await request('/api/search/suggestions?q=next');
    assert(suggestRes.status === 200, `GET /api/search/suggestions?q=next returns 200`);
    const subNames = (suggestRes.body?.subcategories || []).map(s => s.name.toLowerCase());
    assert(subNames.some(s => s.includes('next')), `Suggestions contain Next.js subcategories`);

    // 4. Freelancer Search & Discovery Filtering
    console.log('\n--- Test Suite 4: Freelancer Discovery & INR Pricing Filters ---');
    const freeRes = await request('/api/freelancers');
    assert(freeRes.status === 200, `GET /api/freelancers returns 200`);
    assert(freeRes.body?.freelancers?.length > 0, `Freelancers list is populated`);

    const sampleFreelancer = freeRes.body?.freelancers?.[0];
    assert(typeof sampleFreelancer?.startingPriceINR === 'number' && sampleFreelancer.startingPriceINR > 0,
      `Freelancer has valid startingPriceINR (Got: ₹${sampleFreelancer?.startingPriceINR})`);

    // Subcategory filter test
    const subFilterRes = await request('/api/freelancers?category=graphics-design&subcategory=Logo%20Design');
    assert(subFilterRes.status === 200, `Subcategory filter returns 200`);

    // Price range INR filter
    const priceFilterRes = await request('/api/freelancers?minPriceINR=2000&maxPriceINR=50000');
    assert(priceFilterRes.status === 200, `Price range filter returns 200`);
    const allInRange = (priceFilterRes.body?.freelancers || []).every(f => {
      const p = f.startingPriceINR || f.minBudget * 83;
      return p >= 2000 && p <= 50000;
    });
    assert(allInRange, `All returned freelancers fit within ₹2,000 - ₹50,000 INR range`);

    // Sorting test
    const sortRes = await request('/api/freelancers?sortBy=price_asc');
    assert(sortRes.status === 200, `Sort by price_asc returns 200`);
    const prices = (sortRes.body?.freelancers || []).map(f => f.startingPriceINR || f.minBudget * 83);
    const isSortedAsc = prices.slice(1).every((p, i) => p >= prices[i]);
    assert(isSortedAsc, `Freelancers sorted in ascending price order (Lowest ₹ first)`);

    // 5. Admin Category Security & Management
    console.log('\n--- Test Suite 5: Admin Category Management ---');
    const unauthCreate = await request('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'Unauthorized Category' }
    });
    assert(unauthCreate.status === 403, `Unauthenticated POST /api/categories rejected with 403 Forbidden`);

    console.log('\n====================================================');
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  }
}

runTests();
