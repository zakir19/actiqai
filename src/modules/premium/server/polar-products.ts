"use server";

import { polarClient } from "@/lib/polar";

// Fetch all products from Polar
export async function getPolarProducts() {
  try {
    console.log("🔍 Fetching products from Polar...");
    
    // Get the iterator
    const iterator = polarClient.products.list({
      isArchived: false,
      limit: 100,
    });

    // Await the iterator to get the first page
    const firstPage = await iterator;
    
    console.log("📦 First page result:", firstPage);
    
    // The Polar SDK returns { result: { items: [...] } }
    const products = [];
    
    if (firstPage && typeof firstPage === 'object' && 'result' in firstPage) {
      const result = (firstPage as any).result;
      if (result && result.items && Array.isArray(result.items)) {
        products.push(...result.items);
        console.log(`✅ Found ${result.items.length} products from Polar`);
      }
    }

    console.log(`✅ Total products loaded: ${products.length}`);
    
    // Log each product
    products.forEach((product, index) => {
      console.log(`📦 Product ${index + 1}:`, {
        id: product.id,
        name: product.name,
        description: product.description?.substring(0, 50),
        pricesCount: product.prices?.length || 0,
        prices: product.prices?.map((p: any) => ({
          id: p.id,
          amount: p.priceAmount,
          interval: p.recurringInterval,
        }))
      });
    });
    
    return products;
  } catch (error) {
    console.error("❌ Error fetching Polar products:", error);
    return [];
  }
}

// Get product with its prices
export async function getProductWithPrices(productId: string) {
  try {
    const product = await polarClient.products.get({
      id: productId,
    });

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Get all products with their prices
export async function getAllProductsWithPrices() {
  try {
    const products = await getPolarProducts();
    
    // Polar products already include prices in the response
    return products;
  } catch (error) {
    console.error("Error fetching products with prices:", error);
    return [];
  }
}
