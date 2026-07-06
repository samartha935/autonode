"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

export async function getStripeTriggerRealtimeToken() {
  return getClientSubscriptionToken(inngest, {
    channel: stripeTriggerChannel,
    topics: ["status"],
  });
}
