// scripts/test-product-api.js - Test script for product reliability API
const fetch = require('node-fetch');

// Test data for different product categories
const testProducts = {
  automotive: {
    productData: {
      year: 2020,
      make: 'Toyota',
      model: 'Camry',
      mileage: 50000
    },
    category: 'automotive'
  },
  electronics: {
    productData: {
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      year: 2022,
      usage: 12
    },
    category: 'electronics'
  },
  appliances: {
    productData: {
      brand: 'Samsung',
      model: 'RF28R7351SR',
      type: 'Refrigerator',
      age: 3
    },
    category: 'appliances'
  },
  tools: {
    productData: {
      brand: 'DeWalt',
      model: 'DCD771C2',
      type: 'Cordless Drill',
      usage: 500
    },
    category: 'tools'
  }
};

async function testProductAPI(category, productData) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${category.toUpperCase()} Category`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch('http://localhost:3000/api/product-reliability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productData: productData.productData,
        category: productData.category,
        locale: 'en'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ API Request Successful!');
    console.log('\nProduct:', data.productName || 'Unknown');
    console.log('Overall Score:', data.overallScore || 'N/A');
    console.log('\nCategory Scores:');
    if (data.categories) {
      Object.entries(data.categories).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
    }
    console.log('\nCommon Issues Count:', data.commonIssues?.length || 0);
    console.log('Timeline Items:', data.timeline?.length || 0);
    console.log('Has Specifications:', !!data.specifications);
    
    return true;
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Product Reliability API Test Suite                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\nMake sure the development server is running: npm run dev\n');

  const results = {
    passed: 0,
    failed: 0
  };

  // Test each category
  for (const [category, data] of Object.entries(testProducts)) {
    const success = await testProductAPI(category, data);
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}/${Object.keys(testProducts).length}`);
  console.log(`❌ Failed: ${results.failed}/${Object.keys(testProducts).length}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! The product API is working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.\n');
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
