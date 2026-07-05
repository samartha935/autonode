import { realtime } from "inngest/realtime";
import { z } from "zod";

export const googleFormTriggerChannel = realtime.channel({
  name: "google-form-trigger",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
