"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

export async function getNodeStatusToken() {
  return getClientSubscriptionToken(inngest, {
    channel: manualTriggerChannel,
    topics: ["status"],
  });
}
