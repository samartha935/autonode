import { realtime } from "inngest/realtime";
import { z } from "zod";

export const manualTriggerChannel = realtime.channel({
  name: "manual-trigger-execution",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
