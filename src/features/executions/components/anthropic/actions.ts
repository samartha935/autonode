"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { anthropicChannel } from "@/inngest/channels/anthropic";

export async function getAnthropicRealtimeToken() {
  return getClientSubscriptionToken(inngest, {
    channel: anthropicChannel,
    topics: ["status"],
  });
}
