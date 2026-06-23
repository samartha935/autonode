"use client";

import type { LucideIcon } from "lucide-react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { NodeProps, Position } from "@xyflow/react";
import { memo, type ReactNode } from "react";
import { WorkflowNode } from "@/components/shared/workflow-node";
import Image from "next/image";

type BaseExecutionNodeProps = NodeProps & {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  // status?:NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
};

export const BaseExecutionNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    const handleDelete = () => {};

    return (
      <WorkflowNode
        name={name}
        description={description}
        onDelete={handleDelete}
        onSetting={onSettings}
      >
        {/* TODO: wrap within NodeStatusIndicator */}
        <BaseNode onDoubleClick={onDoubleClick}>
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={name} width={16} height={16} />
            ) : (
              <Icon className="text-muted-foreground size-4" />
            )}
            {children}
            <BaseHandle id="target-1" type="target" position={Position.Left} />
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    );
  },
);

BaseExecutionNode.displayName = "BaseExecutionNode";