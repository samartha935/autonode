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
import { generateGoogleFormScript } from "./utils";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const { data: workflow } = useSuspenseWorkflow(workflowId);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}&secret=${workflow.webhookSecret}`;

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
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Form's Apps Script to trigger
            this workflow when a form is submitted.
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
              <li>Open your Google form</li>
              <li>Click the three dots menu, then script editor </li>
              <li>Copy and paste the script below</li>
              <li>Replay WEBHOOK_URL with your webhook URL above</li>
              <li>Save and click "Triggers", then add Trigger</li>
              <li>Choose: From form then on form submit, then save</li>
            </ol>
          </div>
          <div className="bg-muted space-y-3 rounded-lg p-4">
            <h4 className="text-sm font-medium">Google Apps Script:</h4>
            <Button
              type="button"
              variant={"outline"}
              onClick={async () => {
                const script = generateGoogleFormScript(webhookUrl);
                try {
                  await navigator.clipboard.writeText(script);
                  toast.success("Script copied to clipboard");
                } catch (error) {
                  toast.error("Failed to copy script to clipboard  ");
                }
              }}
            >
              <CopyIcon className="mr-2 size-4" />
              Copy Google Apps Script
            </Button>
            <p className="text-muted-foreground text-xs">
              This script includes your webhook URL and handles from submissions
            </p>
          </div>
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <h4 className="text-sm font-medium">Available variables</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                <code>{"{{googleForm.respondentEmail}}"}</code> - Respondent's
                email
              </li>
              <li>
                <code>{"{{googleForm.responses['Question Name']}}"}</code> -
                Specific answer
              </li>
              <li>
                <code>{"{{json googleForm.responses}}"}</code> - All responses
                as JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
