"use client";

import {
  NodeConfigDialog,
  NodeConfigDialogBody,
  NodeConfigDialogFooter,
  NodeConfigDialogForm,
} from "@/components/shared/node-config-dialog";
import {
  NodeSetupGuide,
  SetupCode,
  SetupEm,
  SetupSteps,
} from "@/components/shared/node-setup-guide";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required." })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and container only letters, numbers and underscores.",
    }),
  username: z.string().optional(),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(2000, "Discord messages cannot exceed 2000 characters"),
  webhookUrl: z.string().min(1, "Webhook URL is required"),
});

export type DiscordFormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<DiscordFormValues>;
};

export const DiscordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<DiscordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      username: defaultValues.username || "",
      content: defaultValues.content || "",
      webhookUrl: defaultValues.webhookUrl || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        username: defaultValues.username || "",
        content: defaultValues.content || "",
        webhookUrl: defaultValues.webhookUrl || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myDiscord";

  const handleSubmit = (values: DiscordFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <NodeConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Discord Configuration"
      description="Send a message to a Discord channel using an incoming webhook. You need a webhook URL for the channel you want to post to."
    >
      <NodeConfigDialogForm onSubmit={form.handleSubmit(handleSubmit)}>
        <NodeConfigDialogBody>
          <FieldSet>
            <FieldGroup>
              <Controller
                name="variableName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Variable Name</FieldLabel>
                    <Input placeholder="myDiscord" {...field} />
                    <FieldDescription>
                      Use this name to reference the result in other nodes:{" "}
                      {`{{${watchVariableName}.text}}`}
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="webhookUrl"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Webhook URL</FieldLabel>
                    <Input
                      placeholder="https://discord.com/api/webhooks/...."
                      type="password"
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    <FieldDescription>
                      Full webhook URL for one channel. Anyone with this URL can
                      post to that channel — treat it like a password. See the
                      setup guide below.
                    </FieldDescription>
                  </Field>
                )}
              />

              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Message Content</FieldLabel>
                    <Textarea
                      placeholder="Summary: {{aiResponse}}"
                      className="min-h-20 font-mono text-sm"
                      {...field}
                    />
                    <FieldDescription>
                      The text Discord will post. Use {"{{variables}}"} for
                      simple values or {"{{json variable}}"} for objects. Max
                      2000 characters (Discord limit).
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Bot username (optional)</FieldLabel>
                    <Input placeholder="Workflow Bot" {...field} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    <FieldDescription>
                      Overrides the webhook&apos;s default display name for this
                      message only. Leave blank to keep the webhook&apos;s
                      default.
                    </FieldDescription>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <NodeSetupGuide
            sections={[
              {
                value: "create-webhook",
                title: "1. Create a channel webhook",
                content: (
                  <>
                    <SetupSteps
                      steps={[
                        <>
                          Open Discord and go to the server and channel where
                          you want messages.
                        </>,
                        <>
                          Click the gear icon next to the channel name (
                          <SetupEm>Edit Channel</SetupEm>), or right-click the
                          channel → <SetupEm>Edit Channel</SetupEm>.
                        </>,
                        <>
                          Open <SetupEm>Integrations</SetupEm> →{" "}
                          <SetupEm>Webhooks</SetupEm> →{" "}
                          <SetupEm>New Webhook</SetupEm> (or Create Webhook).
                        </>,
                        <>
                          Optionally rename it and pick an avatar. Confirm the
                          channel is correct.
                        </>,
                        <>
                          Click <SetupEm>Copy Webhook URL</SetupEm> and paste it
                          into the <SetupEm>Webhook URL</SetupEm> field above.
                        </>,
                      ]}
                    />
                    <p className="text-xs">
                      The URL looks like{" "}
                      <SetupCode>
                        https://discord.com/api/webhooks/ID/TOKEN
                      </SetupCode>
                      . Do not share it publicly.
                    </p>
                  </>
                ),
              },
              {
                value: "message-content",
                title: "2. What to put in Message Content",
                content: (
                  <>
                    <p>
                      Write the message body as plain text. You can pull data
                      from earlier nodes:
                    </p>
                    <ul className="list-disc space-y-1 pl-4">
                      <li>
                        Simple values:{" "}
                        <SetupCode>{"{{myOpenAi.text}}"}</SetupCode>
                      </li>
                      <li>
                        Objects as JSON:{" "}
                        <SetupCode>{"{{json httpResponse.data}}"}</SetupCode>
                      </li>
                    </ul>
                    <p className="text-xs">
                      Discord rejects messages longer than 2000 characters.
                      Mentions like <SetupCode>@everyone</SetupCode> follow the
                      webhook and channel permissions.
                    </p>
                  </>
                ),
              },
              {
                value: "username",
                title: "3. Optional bot username",
                content: (
                  <p>
                    If set, Discord shows this name as the sender instead of the
                    webhook&apos;s default name. Useful when one webhook posts
                    different kinds of alerts (e.g.{" "}
                    <SetupCode>Billing Bot</SetupCode> vs{" "}
                    <SetupCode>Alerts</SetupCode>).
                  </p>
                ),
              },
            ]}
          />
        </NodeConfigDialogBody>

        <NodeConfigDialogFooter>
          <Button type="submit">Save</Button>
        </NodeConfigDialogFooter>
      </NodeConfigDialogForm>
    </NodeConfigDialog>
  );
};
