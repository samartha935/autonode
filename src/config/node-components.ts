import { InitialNode } from "@/components/shared/initial-node";
import { NodeType } from "@/db/schema/workflow-schema";
import type { NodeTypes } from "@xyflow/react";


export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;