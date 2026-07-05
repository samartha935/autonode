import { NodeExecutor } from "@/features/executions/types";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

type GoogleFormTriggerData = Record<string, unknown>;

export const googleFormTriggerExecutor: NodeExecutor<
  GoogleFormTriggerData
> = async ({ nodeId, context, step }) => {
  await step.realtime.publish(
    `${nodeId}-status-loading`,
    googleFormTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  const result = await step.run(`${nodeId}-google-form-trigger`, async () => context);

  await step.realtime.publish(
    `${nodeId}-status-success`,
    googleFormTriggerChannel.status,
    {
      nodeId,
      status: "success",
    },
  );
  return result;
};
