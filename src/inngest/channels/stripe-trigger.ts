import { realtime } from "inngest/realtime";
import { z } from "zod";

export const stripeTriggerChannel = realtime.channel({
  name: "stripe-trigger",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
