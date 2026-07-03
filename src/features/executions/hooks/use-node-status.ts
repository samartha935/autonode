import { type NodeStatus } from "@/components/react-flow/node-status-indicator";
import { useRealtime, type ClientSubscriptionToken } from "inngest/react";
import { type Realtime } from "inngest/realtime";

type StatusData = {
  nodeId: string;
  status: string;
};

type UseNodeStatusOptions = {
  nodeId: string;
  channel: Realtime.ChannelInput;
  token: () => Promise<ClientSubscriptionToken>;
};

export function useNodeStatus({ nodeId, channel, token }: UseNodeStatusOptions) {
  const { messages } = useRealtime({
    channel,
    topics: ["status"] as const,
    token,
  });

  // messages.all is scoped to the subscribed channel+topics.
  // Find the latest message matching this specific nodeId.
  const latestForNode = [...messages.all]
    .reverse()
    .find((msg) => (msg.data as StatusData).nodeId === nodeId);

  const status: NodeStatus = latestForNode
    ? ((latestForNode.data as StatusData).status as NodeStatus)
    : "initial";

  return status;
}
