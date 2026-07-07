import { realtime } from "inngest/realtime";
import { z } from "zod";

export const geminiChannel = realtime.channel({
  name: "gemini-execution",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
