import { realtime } from "inngest/realtime";
import { z } from "zod";

export const httpRequestChannel = realtime.channel({
  name: "http-request-execution",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
