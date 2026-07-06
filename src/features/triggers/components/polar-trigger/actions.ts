"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { polarTriggerChannel } from "@/inngest/channels/polar-trigger";

export async function getPolarTriggerRealtimeToken() {
  return getClientSubscriptionToken(inngest, {
    channel: polarTriggerChannel,
    topics: ["status"],
  });
}
