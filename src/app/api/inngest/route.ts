import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";

export const maxDuration = 120;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeWorkflow],
});
