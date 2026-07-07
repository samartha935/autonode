"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { geminiChannel } from "@/inngest/channels/gemini";

export async function getGeminiRealtimeToken() {
  return getClientSubscriptionToken(inngest, {
    channel: geminiChannel,
    topics: ["status"],
  });
}
