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

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const { data: workflow } = useSuspenseWorkflow(workflowId);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}&secret=${workflow.webhookSecret}`;

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
      title="Stripe Trigger Configuration"
      description="Point a Stripe webhook at this workflow. When Stripe sends an event (e.g. payment succeeded), this workflow starts with that event data."
    >
      <NodeConfigDialogBody>
        <div className="space-y-2">
          <Label htmlFor="stripe-webhook-url">Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              id="stripe-webhook-url"
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
            Unique to this workflow. Includes a secret so only Stripe (or
            someone with this URL) can trigger it.
          </p>
        </div>

        <NodeSetupGuide
          subtitle="Connect Stripe, then use event fields in later nodes"
          sections={[
            {
              value: "stripe-dashboard",
              title: "1. Add the endpoint in Stripe",
              content: (
                <SetupSteps
                  steps={[
                    <>
                      Open the{" "}
                      <SetupEm>Stripe Dashboard</SetupEm> (use Test mode if you
                      are still developing).
                    </>,
                    <>
                      Go to <SetupEm>Developers</SetupEm> →{" "}
                      <SetupEm>Webhooks</SetupEm> →{" "}
                      <SetupEm>Add endpoint</SetupEm>.
                    </>,
                    <>
                      Paste the <SetupEm>Webhook URL</SetupEm> above into the
                      endpoint URL field.
                    </>,
                    <>
                      Under events, select what should start this workflow (e.g.{" "}
                      <SetupCode>payment_intent.succeeded</SetupCode>,{" "}
                      <SetupCode>checkout.session.completed</SetupCode>).
                    </>,
                    <>
                      Save the endpoint. Stripe will send events to this
                      workflow whenever those events occur.
                    </>,
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
                    Stripe shows a signing secret (
                    <SetupCode>whsec_...</SetupCode>) on the endpoint. This
                    app&apos;s URL already includes a{" "}
                    <SetupEm>workflow secret</SetupEm> in the query string for
                    authentication — you do not paste the Stripe signing secret
                    into this dialog.
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
                    <SetupCode>{"{{stripe.eventType}}"}</SetupCode> — event type
                    (e.g. payment_intent.succeeded)
                  </li>
                  <li>
                    <SetupCode>{"{{stripe.amount}}"}</SetupCode> — payment amount
                  </li>
                  <li>
                    <SetupCode>{"{{stripe.currency}}"}</SetupCode> — currency
                  </li>
                  <li>
                    <SetupCode>{"{{stripe.customerId}}"}</SetupCode> — customer
                    ID
                  </li>
                  <li>
                    <SetupCode>{"{{json stripe}}"}</SetupCode> — full event
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
