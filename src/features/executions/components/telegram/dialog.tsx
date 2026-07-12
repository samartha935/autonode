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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { InfoIcon } from "lucide-react";
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
  botToken: z.string().min(1, "Bot token is required"),
  chatId: z.string().min(1, "Chat ID is required"),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(4096, "Telegram messages cannot exceed 4096 characters"),
});

export type TelegramFormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<TelegramFormValues>;
};

export const TelegramDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<TelegramFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      botToken: defaultValues.botToken || "",
      chatId: defaultValues.chatId || "",
      content: defaultValues.content || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        botToken: defaultValues.botToken || "",
        chatId: defaultValues.chatId || "",
        content: defaultValues.content || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myTelegram";

  const handleSubmit = (values: TelegramFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <NodeConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Telegram Configuration"
      description="Send a message with a Telegram bot. You need a bot token and a place to send the message (you, a group, or a channel)."
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
                    <Input placeholder="myTelegram" {...field} />
                    <FieldDescription>
                      Use this name to reference the result in other nodes:{" "}
                      {`{{${watchVariableName}.messageContent}}`}
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="botToken"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Bot Token</FieldLabel>
                    <Input
                      placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      type="password"
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    <FieldDescription>
                      A secret key that lets this app send messages as your bot.
                      See the setup guide below if you need one.
                    </FieldDescription>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="chatId"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Where to send (Chat ID)</FieldLabel>
                    <Input
                      placeholder="e.g. 123456789  or  @my_public_channel"
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    <FieldDescription>
                      This is <span className="font-medium">not</span> your
                      Telegram login password. It tells the bot{" "}
                      <span className="font-medium">
                        who or which channel
                      </span>{" "}
                      should receive the message.
                    </FieldDescription>
                  </Field>
                )}
              />

              <Alert>
                <InfoIcon />
                <AlertTitle>
                  Personal usernames like @yourname do not work
                </AlertTitle>
                <AlertDescription>
                  <p>
                    To message a person (including yourself), you must use a{" "}
                    <span className="font-medium text-foreground">
                      numeric ID
                    </span>{" "}
                    like <code className="text-xs">123456789</code>. Using{" "}
                    <code className="text-xs">@username</code> only works for{" "}
                    <span className="font-medium text-foreground">
                      public channels or public groups
                    </span>
                    .
                  </p>
                </AlertDescription>
              </Alert>

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
                      The text Telegram will send. You can insert values from
                      earlier steps with {"{{ variables }}"} or{" "}
                      {"{{json variable}}"} for objects. Max 4096 characters.
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <NodeSetupGuide
            sections={[
              {
                value: "bot-token",
                title: "1. Create a bot and get a token",
                content: (
                  <>
                    <SetupSteps
                      steps={[
                        <>
                          Open Telegram and search for{" "}
                          <SetupEm>@BotFather</SetupEm> (official Telegram bot
                          for creating bots).
                        </>,
                        <>
                          Start a chat and send <SetupCode>/newbot</SetupCode>.
                        </>,
                        <>
                          Follow the prompts: pick a display name, then a
                          username ending in <SetupCode>bot</SetupCode>.
                        </>,
                        <>
                          BotFather will reply with a long token (looks like{" "}
                          <SetupCode>123456:ABC-DEF...</SetupCode>). Copy that
                          into the <SetupEm>Bot Token</SetupEm> field above.
                        </>,
                      ]}
                    />
                    <p className="text-xs">
                      Treat the token like a password — anyone with it can send
                      messages as your bot.
                    </p>
                  </>
                ),
              },
              {
                value: "message-person",
                title: "2. Message a person (or yourself)",
                content: (
                  <>
                    <p>
                      For DMs, Telegram only accepts a{" "}
                      <SetupEm>numeric Chat ID</SetupEm>. Your @username will
                      not work here.
                    </p>
                    <SetupSteps
                      steps={[
                        <>
                          Open your bot in Telegram and press{" "}
                          <SetupEm>Start</SetupEm> (or send any message like
                          &quot;hi&quot;). The bot cannot message you until you
                          start the chat.
                        </>,
                        <>
                          Find your numeric ID. Easiest option: open Telegram,
                          search for <SetupEm>@userinfobot</SetupEm>, start it,
                          and it will show your <SetupEm>Id</SetupEm> (a number
                          like <SetupCode>123456789</SetupCode>).
                        </>,
                        <>
                          Paste that number into the{" "}
                          <SetupEm>Where to send (Chat ID)</SetupEm> field. Do
                          not add @.
                        </>,
                      ]}
                    />
                    <p className="text-xs">
                      To message someone else: they must also Start your bot
                      first, then use <em>their</em> numeric ID (not yours).
                    </p>
                  </>
                ),
              },
              {
                value: "message-channel",
                title: "3. Message a public channel or group",
                content: (
                  <>
                    <p>
                      Only <SetupEm>public</SetupEm> channels and groups can use
                      a username like <SetupCode>@my_channel</SetupCode>. Private
                      ones need a numeric ID instead.
                    </p>
                    <div className="space-y-2">
                      <p className="text-foreground text-sm font-medium">
                        Make a channel public (if it isn&apos;t already)
                      </p>
                      <SetupSteps
                        steps={[
                          <>
                            Open the channel → tap the name at the top →{" "}
                            <SetupEm>Edit</SetupEm> (or Manage Channel).
                          </>,
                          <>
                            Set channel type to <SetupEm>Public</SetupEm>.
                          </>,
                          <>
                            Choose a public link / username (at least 5
                            characters, unique on Telegram). Example:{" "}
                            <SetupCode>@my_workflow_alerts</SetupCode>.
                          </>,
                        ]}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-foreground text-sm font-medium">
                        Let your bot post there
                      </p>
                      <SetupSteps
                        steps={[
                          <>
                            In the channel, open <SetupEm>Administrators</SetupEm>
                            .
                          </>,
                          <>
                            Add your bot as an admin and turn on{" "}
                            <SetupEm>Post Messages</SetupEm>.
                          </>,
                          <>
                            Put the channel username (with @) into the Chat ID
                            field, e.g.{" "}
                            <SetupCode>@my_workflow_alerts</SetupCode>.
                          </>,
                        ]}
                      />
                    </div>
                    <p className="text-xs">
                      Note: making a channel public means anyone with the link
                      can find and join it.
                    </p>
                  </>
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
