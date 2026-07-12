"use client";

import {
  NodeConfigDialog,
  NodeConfigDialogBody,
} from "@/components/shared/node-config-dialog";
import {
  NodeSetupGuide,
  SetupCode,
  SetupEm,
  SetupSteps,
} from "@/components/shared/node-setup-guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PolarTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const { data: workflow } = useSuspenseWorkflow(workflowId);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const webhookUrl = `${baseUrl}/api/webhooks/polar?workflowId=${workflowId}&secret=${workflow.webhookSecret}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <NodeConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Polar Trigger Configuration"
      description="Point a Polar webhook at this workflow. When Polar sends an event (e.g. checkout created), this workflow starts with that event data."
    >
      <NodeConfigDialogBody>
        <div className="space-y-2">
          <Label htmlFor="polar-webhook-url">Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              id="polar-webhook-url"
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
            >
              <CopyIcon className="size-4" />
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Unique to this workflow. Includes a secret so only Polar (or someone
            with this URL) can trigger it.
          </p>
        </div>

        <NodeSetupGuide
          subtitle="Connect Polar, then use event fields in later nodes"
          sections={[
            {
              value: "polar-dashboard",
              title: "1. Add the endpoint in Polar",
              content: (
                <SetupSteps
                  steps={[
                    <>
                      Open your <SetupEm>Polar Dashboard</SetupEm>.
                    </>,
                    <>
                      Go to <SetupEm>Settings</SetupEm> →{" "}
                      <SetupEm>Webhooks</SetupEm>.
                    </>,
                    <>
                      Click <SetupEm>Add endpoint</SetupEm> and paste the{" "}
                      <SetupEm>Webhook URL</SetupEm> above.
                    </>,
                    <>
                      Select events to listen for (e.g.{" "}
                      <SetupCode>checkout.created</SetupCode>, subscription or
                      order events you care about).
                    </>,
                    <>Save the endpoint.</>,
                  ]}
                />
              ),
            },
            {
              value: "signing-secret",
              title: "2. About the signing secret",
              content: (
                <>
                  <p>
                    Polar may show a signing secret when you create the
                    endpoint. This app authenticates using the{" "}
                    <SetupEm>secret</SetupEm> already in the webhook URL query
                    string — you do not paste Polar&apos;s signing secret into
                    this dialog.
                  </p>
                  <p className="text-xs">
                    Keep the webhook URL private. Anyone with it could trigger
                    the workflow.
                  </p>
                </>
              ),
            },
            {
              value: "variables",
              title: "3. Available variables in later nodes",
              content: (
                <ul className="space-y-2">
                  <li>
                    <SetupCode>{"{{polar.eventType}}"}</SetupCode> — event type
                    (e.g. checkout.created)
                  </li>
                  <li>
                    <SetupCode>{"{{polar.amount}}"}</SetupCode> — payment amount
                  </li>
                  <li>
                    <SetupCode>{"{{polar.currency}}"}</SetupCode> — currency
                  </li>
                  <li>
                    <SetupCode>{"{{polar.customerId}}"}</SetupCode> — customer ID
                  </li>
                  <li>
                    <SetupCode>{"{{json polar}}"}</SetupCode> — full event
                    payload as JSON
                  </li>
                </ul>
              ),
            },
          ]}
        />
      </NodeConfigDialogBody>
    </NodeConfigDialog>
  );
};
