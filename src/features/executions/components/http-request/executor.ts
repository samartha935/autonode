import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (value) => {
  try {
    const jsonString = JSON.stringify(value, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
  } catch (error) {
    throw new Error(
      `Failed to serialize context to JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
});

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `${nodeId}-status-loading`,
    httpRequestChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  try {
    if (!data.endpoint) {
      throw new NonRetriableError("HTTP Request node: No endpoint configured");
    }

    if (!data.variableName) {
      throw new NonRetriableError(
        "HTTP Request node: Variable name not configured.",
      );
    }

    if (!data.method) {
      throw new NonRetriableError("HTTP Request node: Method not configured.");
    }
  } catch (error) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      httpRequestChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
  }

  try {
    const result = await step.run(`${nodeId}-http-request`, async () => {
      let endpoint: string;
      try {
        const template = Handlebars.compile(data.endpoint);
        endpoint = template(context);

        if (!endpoint || typeof endpoint !== "string") {
          throw new Error(
            "End point template must resolve to a non-empty string",
          );
        }
      } catch (error) {
        throw new NonRetriableError(
          `HTTP Request node: Failed to resolve endpoint template: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      const method = data.method;

      const options: KyOptions = { method };

      if (["POST", "PUT", "PATCH"].includes(method)) {
        const resolved = Handlebars.compile(data.body || "{}")(context);
        JSON.parse(resolved);
        options.body = resolved;
        options.headers = {
          "Content-Type": "application/json",
        };
      }

      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };

      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    });

    await step.realtime.publish(
      `${nodeId}-status-success`,
      httpRequestChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      httpRequestChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw error;
  }
};
