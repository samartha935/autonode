import { realtime } from "inngest/realtime";
import { z } from "zod";

export const discordChannel = realtime.channel({
  name: "discord-execution",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
