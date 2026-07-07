import { realtime } from "inngest/realtime";
import { z } from "zod";

export const anthropicChannel = realtime.channel({
  name: "anthropic-execution",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
