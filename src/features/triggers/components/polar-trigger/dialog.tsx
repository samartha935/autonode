"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

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

  const copyToClickpboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard ");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Polar Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Polar Dashboard to trigger this
            workflow on Polar events.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant={"outline"}
                onClick={copyToClickpboard}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <h4 className="text-sm font-medium">SetUp Instructions</h4>
            <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
              <li>Open your Polar Dashboard</li>
              <li>Go to Settings, then Webhooks </li>
              <li>Click "Add endpoint"</li>
              <li>Paste the webhook URL above</li>
              <li>Select events to listen for (e.g., checkout.created)</li>
              <li>Save and copy the signing secret</li>
            </ol>
          </div>

          <div className="bg-muted space-y-2 rounded-lg p-4">
            <h4 className="text-sm font-medium">Available variables</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{polar.eventType}}"}
                </code>{" "}
                - Event type (e.g., checkout.created)
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{polar.amount}}"}
                </code>{" "}
                - Payment amount
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{polar.currency}}"}
                </code>{" "}
                - Currency
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{polar.customerId}}"}
                </code>{" "}
                - Customer ID
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{json polar}}"}
                </code>{" "}
                - Full event data as JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
