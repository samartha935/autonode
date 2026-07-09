"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { getTelegramRealtimeToken } from "./actions";
import { TelegramDialog, TelegramFormValues } from "./dialog";
import { telegramChannel } from "@/inngest/channels/telegram";

type TelegramNodeData = {
  botToken?: string;
  chatId?: string;
  content?: string;
  variableName?: string;
};

type TelegramNodeType = Node<TelegramNodeData>;

export const TelegramNode = memo((props: NodeProps<TelegramNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: telegramChannel,
    token: getTelegramRealtimeToken,
  });

  const handleOpenSetting = () => setDialogOpen(true);

  const handleSubmit = (values: TelegramFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData?.content
    ? `Send : ${nodeData.content.slice(0, 50)}... `
    : "Not configured";

  return (
    <>
      <TelegramDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/logos/telegram.svg"}
        status={nodeStatus}
        name="Telegram"
        description={description}
        onSettings={handleOpenSetting}
        onDoubleClick={handleOpenSetting}
      />
    </>
  );
});

TelegramNode.displayName = "TelegramNode";
