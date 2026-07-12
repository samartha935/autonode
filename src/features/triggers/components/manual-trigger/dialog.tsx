"use client";

import {
  NodeConfigDialog,
  NodeConfigDialogBody,
} from "@/components/shared/node-config-dialog";
import {
  NodeSetupGuide,
  SetupCode,
  SetupEm,
} from "@/components/shared/node-setup-guide";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ManualTriggerDialog = ({ open, onOpenChange }: Props) => {
  return (
    <NodeConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Manual Trigger"
      description="Starts the workflow when you click Run in the editor. No external account or webhook setup is required."
    >
      <NodeConfigDialogBody>
        <p className="text-muted-foreground text-sm">
          This node is the entry point for on-demand runs. There are no fields
          to configure — place it at the start of your graph, add action nodes
          after it, then use <SetupEm>Execute</SetupEm> / Run to start the
          workflow.
        </p>

        <NodeSetupGuide
          subtitle="How this trigger fits into a workflow"
          sections={[
            {
              value: "when-to-use",
              title: "When to use a manual trigger",
              content: (
                <ul className="list-disc space-y-2 pl-4">
                  <li>
                    Testing a flow while you build it (no Stripe / form /
                    webhook needed).
                  </li>
                  <li>
                    One-off or occasional jobs you start yourself from the UI.
                  </li>
                  <li>
                    Workflows that should not react to external events
                    automatically.
                  </li>
                </ul>
              ),
            },
            {
              value: "how-to-run",
              title: "How to run the workflow",
              content: (
                <p>
                  Open the workflow in the editor and use the execute / run
                  control in the header. Execution starts at this node and
                  continues through connected steps. There is no payload from
                  an external service — later nodes rely on their own inputs or
                  on data produced by previous action nodes (e.g.{" "}
                  <SetupCode>{"{{myOpenAi.text}}"}</SetupCode>).
                </p>
              ),
            },
          ]}
        />
      </NodeConfigDialogBody>
    </NodeConfigDialog>
  );
};
