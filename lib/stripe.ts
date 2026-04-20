import "server-only";
import Stripe from "stripe";
import { serverEnv } from "@/lib/env/server";

let stripeSingleton: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!serverEnv.STRIPE_SECRET_KEY) return null;
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(serverEnv.STRIPE_SECRET_KEY);
  }
  return stripeSingleton;
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status | null | undefined,
): "active" | "inactive" | "trialing" {
  if (status === "trialing") return "trialing";
  if (status === "active") return "active";
  return "inactive";
}

export function isPaidSubscriptionStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}
