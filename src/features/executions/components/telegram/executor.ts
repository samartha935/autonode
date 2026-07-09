import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "@/features/executions/lib/handlebars-helpers";
import { telegramChannel } from "@/inngest/channels/telegram";
import ky from "ky";

type TelegramData = {
  variableName?: string;
  botToken?: string;
  chatId?: string;
  content?: string;
};

type TelegramApiResponse = {
  ok: boolean;
  description?: string;
  error_code?: number;
  result?: {
    message_id?: number;
  };
};

export const telegramExecutor: NodeExecutor<TelegramData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `${nodeId}-status-loading`,
    telegramChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (!data.content) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      telegramChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("Telegram node: Content is missing.");
  }

  if (!data.chatId) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      telegramChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("Telegram node: Chat ID is missing.");
  }

  const content = Handlebars.compile(data.content, { noEscape: true })(context);
  const chatId = Handlebars.compile(data.chatId, { noEscape: true })(context);

  try {
    const result = await step.run("telegram-send-message", async () => {
      if (!data.variableName) {
        await step.realtime.publish(
          `${nodeId}-status-error`,
          telegramChannel.status,
          {
            nodeId,
            status: "error",
          },
        );

        throw new NonRetriableError("Telegram node: Variable name is missing.");
      }

      if (!data.botToken) {
        await step.realtime.publish(
          `${nodeId}-status-error`,
          telegramChannel.status,
          {
            nodeId,
            status: "error",
          },
        );

        throw new NonRetriableError("Telegram node: Bot token is missing.");
      }

      const messageText = content.slice(0, 4096); // Telegram's max message length

      const response = await ky
        .post(`https://api.telegram.org/bot${data.botToken}/sendMessage`, {
          json: {
            chat_id: chatId,
            text: messageText,
          },
          throwHttpErrors: false,
        })
        .json<TelegramApiResponse>();

      if (!response.ok) {
        const isTransient =
          response.error_code === 429 || (response.error_code ?? 0) >= 500;
        if (isTransient) {
          throw new Error(
            `Telegram node: ${response.description ?? "Failed to send message."}`,
          );
        }
        throw new NonRetriableError(
          `Telegram node: ${response.description ?? "Failed to send message."}`,
        );
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: messageText,
          messageId: response.result?.message_id,
        },
      };
    });

    await step.realtime.publish(
      `${nodeId}-status-success`,
      telegramChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      telegramChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw error;
  }
};
