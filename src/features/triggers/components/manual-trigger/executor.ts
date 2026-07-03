import { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish("status-loading", manualTriggerChannel.status, {
    nodeId,
    status: "loading",
  });

  const result = await step.run("manual-trigger", async () => context);

  await step.realtime.publish("status-success", manualTriggerChannel.status, {
    nodeId,
    status: "success",
  });
  return result;
};
