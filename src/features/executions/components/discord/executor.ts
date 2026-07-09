import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "@/features/executions/lib/handlebars-helpers";
import { discordChannel } from "@/inngest/channels/discord";
import ky from "ky";

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `${nodeId}-status-loading`,
    discordChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (!data.content) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      discordChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("Discord node: Content is missing.");
  }
  const content = Handlebars.compile(data.content, { noEscape: true })(context);
  const username = data.username
    ? Handlebars.compile(data.username, { noEscape: true })(context)
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.variableName) {
        await step.realtime.publish(
          `${nodeId}-status-error`,
          discordChannel.status,
          {
            nodeId,
            status: "error",
          },
        );

        throw new NonRetriableError("Discord node: Variable name is missing.");
      }

      if (!data.webhookUrl) {
        await step.realtime.publish(
          `${nodeId}-status-error`,
          discordChannel.status,
          {
            nodeId,
            status: "error",
          },
        );

        throw new NonRetriableError("Discord node: Webhook URL is missing.");
      }

      await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000), //Discord's max message length
          username,
        },
      });

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await step.realtime.publish(
      `${nodeId}-status-success`,
      discordChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      discordChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw error;
  }
};
