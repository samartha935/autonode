"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { telegramChannel } from "@/inngest/channels/telegram";

export async function getTelegramRealtimeToken() {
  return getClientSubscriptionToken(inngest, {
    channel: telegramChannel,
    topics: ["status"],
  });
}
