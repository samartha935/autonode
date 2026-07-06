import { realtime } from "inngest/realtime";
import { z } from "zod";

export const polarTriggerChannel = realtime.channel({
  name: "polar-trigger",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
