// Test script to check what products exist in Polar
// Run with: node test-polar-api.js

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN || 'YOUR_TOKEN_HERE';

async function testPolarAPI() {
  try {
    console.log('🔍 Fetching products from Polar API...\n');
    
    const response = await fetch('https://sandbox-api.polar.sh/v1/products?limit=100', {
      headers: {
        'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    console.log('📦 Response:', JSON.stringify(data, null, 2));
    
    if (data.items) {
      console.log('\n✅ Found', data.items.length, 'products\n');
      
      data.items.forEach((product, index) => {
        console.log(`\n📦 Product ${index + 1}:`);
        console.log('  Name:', product.name);
        console.log('  ID:', product.id);
        console.log('  Prices:', product.prices?.length || 0);
        
        if (product.prices && product.prices.length > 0) {
          product.prices.forEach((price, i) => {
            console.log(`\n  💰 Price ${i + 1}:`);
            console.log('    Price ID:', price.id);
            console.log('    Amount:', price.priceAmount / 100);
            console.log('    Interval:', price.recurringInterval);
            console.log('    Is Archived:', price.isArchived);
          });
        } else {
          console.log('  ⚠️  NO PRICES FOUND FOR THIS PRODUCT!');
        }
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPolarAPI();
