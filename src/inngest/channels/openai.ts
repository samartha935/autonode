import { realtime } from "inngest/realtime";
import { z } from "zod";

export const openAiChannel = realtime.channel({
  name: "openai-execution",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
