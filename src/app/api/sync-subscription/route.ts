import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { polarClient } from "@/lib/polar";

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's Polar customer ID
    const [userData] = await db
      .select({
        polarCustomerId: user.polarCustomerId,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData || !userData.polarCustomerId) {
      return NextResponse.json(
        { error: "No Polar customer ID found" },
        { status: 400 }
      );
    }

    // Fetch subscriptions from Polar
    const subscriptionsIterator = polarClient.subscriptions.list({
      customerId: userData.polarCustomerId,
      active: true,
    });

    // Await the iterator to get the first page
    const subscriptionsPage = await subscriptionsIterator;
    console.log("📦 Subscriptions from Polar:", subscriptionsPage);

    // Get subscriptions from result.items
    const subscriptions = subscriptionsPage.result?.items || [];

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Get the first active subscription
    const activeSubscription = subscriptions.find(
      (sub: any) => sub.status === "active" || sub.status === "trialing"
    );

    if (!activeSubscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Determine plan type from subscription
    const productName = activeSubscription.product?.name?.toLowerCase() || "";
    let planType: "free" | "monthly" | "yearly" | "enterprise" = "free";

    if (productName.includes("month") && !productName.includes("year")) {
      planType = "monthly";
    } else if (productName.includes("year") || productName.includes("annual")) {
      planType = "yearly";
    } else if (productName.includes("enterprise")) {
      planType = "enterprise";
    }

    // Update user's plan in database
    await db
      .update(user)
      .set({
        plan: planType,
        subscriptionId: activeSubscription.id,
        subscriptionStatus: activeSubscription.status,
      })
      .where(eq(user.id, userId));

    return NextResponse.json({
      success: true,
      plan: planType,
      subscriptionId: activeSubscription.id,
      status: activeSubscription.status,
      productName: activeSubscription.product?.name,
    });
  } catch (error) {
    console.error("Error syncing subscription:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
