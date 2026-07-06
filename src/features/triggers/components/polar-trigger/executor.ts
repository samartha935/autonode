import { NodeExecutor } from "@/features/executions/types";
import { polarTriggerChannel } from "@/inngest/channels/polar-trigger";

type PolarTriggerData = Record<string, unknown>;

export const polarTriggerExecutor: NodeExecutor<PolarTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `${nodeId}-status-loading`,
    polarTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  const result = await step.run(`${nodeId}-polar-trigger`, async () => context);

  await step.realtime.publish(
    `${nodeId}-status-success`,
    polarTriggerChannel.status,
    {
      nodeId,
      status: "success",
    },
  );
  return result;
};
