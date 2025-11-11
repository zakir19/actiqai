"use client";

import { useState } from "react";
import { PricingCard } from "../components/pricing-card";
import { createPolarCheckout, getUserUsageAndPlan } from "../../server/procedures";
import { useRouter } from "next/navigation";

interface UpgradeViewProps {
  initialData: Awaited<ReturnType<typeof getUserUsageAndPlan>>;
  polarProducts: any[]; // Polar product type
}

export function UpgradeView({ initialData, polarProducts }: UpgradeViewProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  // Debug: Log the products to see what we're getting
  console.log("Polar Products:", polarProducts);
  
  // Log detailed structure of first product
  if (polarProducts && polarProducts.length > 0) {
    console.log("🔍 First product detailed structure:", JSON.stringify(polarProducts[0], null, 2));
  }

  const handleSelectPlan = async (priceId: string, productId: string, isEnterprise: boolean = false) => {
    console.log("🔵 handleSelectPlan called with:", { 
      priceId,
      productId, 
      isEnterprise,
      priceIdType: typeof priceId,
      priceIdLength: priceId?.length 
    });

    if (isEnterprise) {
      // Redirect to contact form or email
      window.location.href = "mailto:sales@actiq.ai?subject=Enterprise%20Plan%20Inquiry";
      return;
    }

    if (!productId) {
      console.error("❌ Product ID not provided");
      alert("Error: No product ID available for this product");
      return;
    }

    // Validate it looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      console.error("❌ Invalid product ID format:", productId);
      alert(`Error: Invalid product ID format: ${productId}`);
      return;
    }

    setLoadingPlan(productId);

    try {
      console.log("🔵 Calling createPolarCheckout with product ID:", productId);
      const checkout = await createPolarCheckout(productId);
      console.log("✅ Checkout response:", checkout);

      // Redirect to Polar checkout
      if (checkout.url) {
        console.log("🔵 Redirecting to:", checkout.url);
        window.location.href = checkout.url;
      } else {
        console.error("❌ No checkout URL returned");
        alert("Error: No checkout URL received");
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error("❌ Error creating checkout:", error);
      alert(`Error creating checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoadingPlan(null);
    }
  };

  const currentPlan = initialData.user.plan;

  // Helper to determine plan type from product name
  const getPlanType = (productName?: string) => {
    if (!productName) return "monthly";
    const name = productName.toLowerCase();
    if (name.includes("month") && !name.includes("year")) return "monthly";
    if (name.includes("year") || name.includes("annual")) return "yearly";
    if (name.includes("enterprise")) return "enterprise";
    return "monthly";
  };

  // Helper to extract features from product description
  const getFeatures = (product: any, planType: string) => {
    // Log product structure to debug
    console.log("📦 Product structure:", {
      name: product.name,
      description: product.description,
      benefits: product.benefits,
      hasDescription: !!product.description,
      hasBenefits: !!product.benefits,
    });

    // First, check if product has benefits array (Polar's standard field)
    if (product.benefits && Array.isArray(product.benefits)) {
      const benefitDescriptions = product.benefits
        .map((benefit: any) => benefit.description || benefit)
        .filter((desc: string) => desc && desc.trim());
      
      if (benefitDescriptions.length > 0) {
        console.log("✅ Using benefits:", benefitDescriptions);
        return benefitDescriptions;
      }
    }

    // Second, try parsing description
    if (product.description) {
      // Split description by newlines, bullets, or dashes
      const features = product.description
        .split(/\n|•|•|-|—/)
        .map((f: string) => f.trim())
        .filter((f: string) => f && f.length > 2) // Filter out empty or too short
        .slice(0, 6); // Limit to 6 features
      
      if (features.length > 0) {
        console.log("✅ Using description features:", features);
        return features;
      }
    }

    // Fallback features based on plan type
    console.log("⚠️ Using fallback features for", planType);
    if (planType === "monthly") {
      return [
        "15 AI Agents",
        "15 Meetings per month",
        "Real-time voice calls",
        "Call recordings & transcripts",
        "Priority support",
      ];
    } else if (planType === "yearly") {
      return [
        "Unlimited AI Agents",
        "Unlimited Meetings",
        "Real-time voice calls",
        "Call recordings & transcripts",
        "Priority support",
        "Advanced analytics",
      ];
    } else {
      return [
        "Everything in Yearly",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom training",
      ];
    }
  };

  // Sort products: monthly, yearly, enterprise
  const sortedProducts = polarProducts.filter(p => p && p.name).sort((a, b) => {
    const orderMap: Record<string, number> = { monthly: 1, yearly: 2, enterprise: 3 };
    const typeA = getPlanType(a.name);
    const typeB = getPlanType(b.name);
    return (orderMap[typeA] || 99) - (orderMap[typeB] || 99);
  });

  // Show message if no products found
  if (!polarProducts || polarProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Upgrade Your Plan</h1>
          <p className="text-lg text-muted-foreground mb-8">
            No products available at the moment.
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact{" "}
            <a href="mailto:support@actiq.ai" className="text-primary hover:underline">
              support@actiq.ai
            </a>
            {" "}for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Upgrade Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Choose the perfect plan for your AI communication needs
        </p>
        {currentPlan !== "free" && (
          <p className="mt-2 text-sm text-muted-foreground">
            Current plan: <span className="font-semibold">{initialData.limits.displayName}</span>
          </p>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sortedProducts.map((product) => {
          if (!product || !product.id) {
            console.warn("Invalid product:", product);
            return null;
          }

          const planType = getPlanType(product.name);
          const isEnterprise = planType === "enterprise";
          
          // Get the first price for this product
          const price = product.prices?.[0];
          
          // Check if product has priceId directly (some Polar setups)
          // or get it from the price object
          const priceId = product.priceId || price?.priceId || price?.id;
          
          const priceAmount = price?.priceAmount || product.priceAmount;
          const finalPriceAmount = priceAmount ? priceAmount / 100 : 0;
          const interval = price?.recurringInterval || product.interval || "month";
          
          // Determine if this is the user's current plan
          const isCurrentPlan = currentPlan === planType;
          
          // Debug: Log price information with ALL fields
          console.log(`💰 Product ${product.name}:`, {
            productId: product.id,
            productPriceId: product.priceId,
            priceObjectPriceId: price?.priceId,
            priceObjectId: price?.id,
            finalPriceId: priceId,
            priceAmount: finalPriceAmount,
            interval: interval,
            productFields: Object.keys(product),
            priceFields: price ? Object.keys(price) : [],
            fullPriceObject: price,
          });

          // Skip if no valid price
          if (!priceId) {
            console.warn(`⚠️ Skipping product "${product.name}" - no valid price ID found`);
            return null;
          }

          return (
            <PricingCard
              key={product.id}
              title={product.name || "Plan"}
              description={product.description?.substring(0, 100) || `Perfect for ${planType} subscription`}
              price={isEnterprise ? "Custom" : finalPriceAmount}
              interval={!isEnterprise ? interval : undefined}
              savings={planType === "yearly" ? "2 months free!" : undefined}
              features={getFeatures(product, planType)}
              isPopular={planType === "yearly"}
              highlighted={planType === "yearly"}
              isEnterprise={isEnterprise}
              onSelect={() => handleSelectPlan(priceId, product.id, isEnterprise)}
              isLoading={loadingPlan === product.id}
              currentPlan={isCurrentPlan}
            />
          );
        }).filter(Boolean)}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include a 14-day money-back guarantee. Need help choosing?{" "}
          <a href="mailto:support@actiq.ai" className="text-primary hover:underline">
            Contact our team
          </a>
        </p>
      </div>
    </div>
  );
}
