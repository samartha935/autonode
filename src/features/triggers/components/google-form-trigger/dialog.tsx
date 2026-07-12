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
import { generateGoogleFormScript } from "./utils";

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

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const copyScript = async () => {
    const script = generateGoogleFormScript(webhookUrl);
    try {
      await navigator.clipboard.writeText(script);
      toast.success("Script copied to clipboard");
    } catch {
      toast.error("Failed to copy script to clipboard");
    }
  };

  return (
    <NodeConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Google Form Trigger Configuration"
      description="When someone submits your Google Form, an Apps Script posts to this webhook and starts the workflow with the answers."
    >
      <NodeConfigDialogBody>
        <div className="space-y-2">
          <Label htmlFor="google-form-webhook-url">Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              id="google-form-webhook-url"
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={copyWebhookUrl}
            >
              <CopyIcon className="size-4" />
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Already embedded in the generated Apps Script if you use the copy
            button below. Keep this URL private.
          </p>
        </div>

        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-sm font-medium">Google Apps Script</p>
          <p className="text-muted-foreground text-xs">
            Includes your webhook URL and sends form answers on submit.
          </p>
          <Button type="button" variant="outline" onClick={copyScript}>
            <CopyIcon className="mr-2 size-4" />
            Copy Google Apps Script
          </Button>
        </div>

        <NodeSetupGuide
          subtitle="Wire the form once, then map answers in later nodes"
          sections={[
            {
              value: "install-script",
              title: "1. Install the Apps Script on your form",
              content: (
                <SetupSteps
                  steps={[
                    <>
                      Open your <SetupEm>Google Form</SetupEm>.
                    </>,
                    <>
                      Click the three-dot menu (top right) →{" "}
                      <SetupEm>Script editor</SetupEm>.
                    </>,
                    <>
                      Delete any sample code, then paste the script from{" "}
                      <SetupEm>Copy Google Apps Script</SetupEm> above (it
                      already includes this workflow&apos;s webhook URL).
                    </>,
                    <>
                      Save the project (disk icon) and give it a name if
                      prompted.
                    </>,
                  ]}
                />
              ),
            },
            {
              value: "trigger",
              title: "2. Add an on-form-submit trigger",
              content: (
                <SetupSteps
                  steps={[
                    <>
                      In the Apps Script editor, open{" "}
                      <SetupEm>Triggers</SetupEm> (clock icon in the left
                      sidebar).
                    </>,
                    <>
                      Click <SetupEm>Add Trigger</SetupEm>.
                    </>,
                    <>
                      Choose the function that runs on submit (usually{" "}
                      <SetupCode>onFormSubmit</SetupCode> or the name in the
                      script), event source <SetupEm>From form</SetupEm>, event
                      type <SetupEm>On form submit</SetupEm>.
                    </>,
                    <>
                      Save. Google may ask you to authorize the script — allow
                      access so it can run when the form is submitted.
                    </>,
                  ]}
                />
              ),
            },
            {
              value: "test",
              title: "3. Test the connection",
              content: (
                <SetupSteps
                  steps={[
                    <>
                      Submit a test response on your form (or use{" "}
                      <SetupEm>Preview</SetupEm>).
                    </>,
                    <>
                      Confirm a new workflow execution appears for this
                      workflow.
                    </>,
                    <>
                      If nothing runs, re-check the trigger, authorization, and
                      that the script still contains the correct webhook URL.
                    </>,
                  ]}
                />
              ),
            },
            {
              value: "variables",
              title: "4. Available variables in later nodes",
              content: (
                <ul className="space-y-2">
                  <li>
                    <SetupCode>{"{{googleForm.respondentEmail}}"}</SetupCode> —
                    respondent&apos;s email (if the form collects it)
                  </li>
                  <li>
                    <SetupCode>
                      {"{{googleForm.responses['Question Name']}}"}
                    </SetupCode>{" "}
                    — answer for a specific question (use the exact question
                    title)
                  </li>
                  <li>
                    <SetupCode>{"{{json googleForm.responses}}"}</SetupCode> —
                    all answers as JSON
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
