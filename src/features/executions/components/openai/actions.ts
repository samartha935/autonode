"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { openAiChannel } from "@/inngest/channels/openai";

export async function getOpenAiRealtimeToken() {
  return getClientSubscriptionToken(inngest, {
    channel: openAiChannel,
    topics: ["status"],
  });
}
