"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PLAN_LIMITS } from "../constants";
import { polarClient } from "@/lib/polar";

// Get current user session
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

// Get user's subscription status and usage
export async function getUserUsageAndPlan() {
  const currentUser = await getCurrentUser();

  const [userData] = await db
    .select({
      plan: user.plan,
      meetingsUsed: user.meetingsUsed,
      agentsUsed: user.agentsUsed,
      subscriptionId: user.subscriptionId,
      subscriptionStatus: user.subscriptionStatus,
      polarCustomerId: user.polarCustomerId,
    })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

  if (!userData) {
    throw new Error("User not found");
  }

  const planLimits = PLAN_LIMITS[userData.plan];

  return {
    user: userData,
    limits: planLimits,
    canCreateAgent: planLimits.agents === -1 || userData.agentsUsed < planLimits.agents,
    canCreateMeeting: planLimits.meetings === -1 || userData.meetingsUsed < planLimits.meetings,
  };
}

// Check if user can create an agent
export async function checkCanCreateAgent() {
  const { canCreateAgent, user: userData, limits } = await getUserUsageAndPlan();

  if (!canCreateAgent) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.agents} agents for your ${limits.displayName}. Upgrade to create more agents.`,
      currentUsage: userData.agentsUsed,
      limit: limits.agents,
    };
  }

  return {
    allowed: true,
    currentUsage: userData.agentsUsed,
    limit: limits.agents,
  };
}

// Check if user can create a meeting
export async function checkCanCreateMeeting() {
  const { canCreateMeeting, user: userData, limits } = await getUserUsageAndPlan();

  if (!canCreateMeeting) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.meetings} meetings for your ${limits.displayName}. Upgrade to create more meetings.`,
      currentUsage: userData.meetingsUsed,
      limit: limits.meetings,
    };
  }

  return {
    allowed: true,
    currentUsage: userData.meetingsUsed,
    limit: limits.meetings,
  };
}

// Increment agent count
export async function incrementAgentCount() {
  const currentUser = await getCurrentUser();

  await db
    .update(user)
    .set({
      agentsUsed: sql`${user.agentsUsed} + 1`,
    })
    .where(eq(user.id, currentUser.id));
}

// Increment meeting count
export async function incrementMeetingCount() {
  const currentUser = await getCurrentUser();

  await db
    .update(user)
    .set({
      meetingsUsed: sql`${user.meetingsUsed} + 1`,
    })
    .where(eq(user.id, currentUser.id));
}

// Create Polar checkout session
export async function createPolarCheckout(productPriceId: string) {
  const currentUser = await getCurrentUser();

  // Get or create Polar customer ID
  const [userData] = await db
    .select({
      polarCustomerId: user.polarCustomerId,
      email: user.email,
    })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

  if (!userData) {
    throw new Error("User not found");
  }

  try {
    // Use Polar SDK to create checkout directly
    let customerId = userData.polarCustomerId;

    // If no Polar customer ID, create one
    if (!customerId) {
      const customer = await polarClient.customers.create({
        email: userData.email,
      });

      customerId = customer.id;

      // Update user with Polar customer ID
      await db
        .update(user)
        .set({
          polarCustomerId: customerId,
        })
        .where(eq(user.id, currentUser.id));
    }

    // Create checkout session using Polar SDK
    console.log("🛒 Creating Polar checkout with:", {
      productId: productPriceId,
      customerId,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade/success`,
    });

    // Polar checkout API requires products array with product IDs
    const checkout = await polarClient.checkouts.create({
      products: [productPriceId], // Product ID (not price ID)
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade/success`,
      customerId: customerId,
    });

    console.log("✅ Checkout created successfully:", {
      checkoutId: checkout.id,
      checkoutUrl: checkout.url,
    });

    return {
      url: checkout.url,
      id: checkout.id,
    };
  } catch (error) {
    console.error("❌ Error creating Polar checkout:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}

// Get user's Polar subscription details
export async function getUserPolarSubscription() {
  const currentUser = await getCurrentUser();

  const [userData] = await db
    .select({
      polarCustomerId: user.polarCustomerId,
      subscriptionId: user.subscriptionId,
      subscriptionStatus: user.subscriptionStatus,
      plan: user.plan,
    })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

  if (!userData || !userData.subscriptionId) {
    return null;
  }

  try {
    const subscription = await polarClient.subscriptions.get({
      id: userData.subscriptionId,
    });

    return {
      ...subscription,
      localPlan: userData.plan,
      localStatus: userData.subscriptionStatus,
    };
  } catch (error) {
    console.error("Error fetching Polar subscription:", error);
    return null;
  }
}

// Update user plan (called by webhook)
export async function updateUserPlan(userId: string, plan: "free" | "monthly" | "yearly" | "enterprise", subscriptionId?: string, status?: string) {
  await db
    .update(user)
    .set({
      plan,
      subscriptionId,
      subscriptionStatus: status,
    })
    .where(eq(user.id, userId));
}
