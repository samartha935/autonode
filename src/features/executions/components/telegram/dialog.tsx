"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CircleHelpIcon, InfoIcon } from "lucide-react";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>Telegram Configuration</DialogTitle>
          <DialogDescription>
            Send a message with a Telegram bot. You need a bot token and a place
            to send the message (you, a group, or a channel).
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
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
                        A secret key that lets this app send messages as your
                        bot. See the setup guide below if you need one.
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
                        <span className="font-medium">who or which channel</span>{" "}
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

            <div className="rounded-lg border">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <CircleHelpIcon className="text-muted-foreground size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Setup guide</p>
                  <p className="text-muted-foreground text-xs">
                    Step-by-step help — open the section that matches what you
                    want to do
                  </p>
                </div>
              </div>

              <Accordion type="multiple" className="px-4">
                <AccordionItem value="bot-token">
                  <AccordionTrigger>1. Create a bot and get a token</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground space-y-2">
                    <ol className="list-decimal space-y-2 pl-4">
                      <li>
                        Open Telegram and search for{" "}
                        <span className="text-foreground font-medium">
                          @BotFather
                        </span>{" "}
                        (official Telegram bot for creating bots).
                      </li>
                      <li>
                        Start a chat and send{" "}
                        <code className="text-foreground text-xs">
                          /newbot
                        </code>
                        .
                      </li>
                      <li>
                        Follow the prompts: pick a display name, then a username
                        ending in <code className="text-xs">bot</code>.
                      </li>
                      <li>
                        BotFather will reply with a long token (looks like{" "}
                        <code className="text-xs">
                          123456:ABC-DEF...
                        </code>
                        ). Copy that into the{" "}
                        <span className="text-foreground font-medium">
                          Bot Token
                        </span>{" "}
                        field above.
                      </li>
                    </ol>
                    <p className="text-xs">
                      Treat the token like a password — anyone with it can send
                      messages as your bot.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="message-person">
                  <AccordionTrigger>
                    2. Message a person (or yourself)
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground space-y-3">
                    <p>
                      For DMs, Telegram only accepts a{" "}
                      <span className="text-foreground font-medium">
                        numeric Chat ID
                      </span>
                      . Your @username will not work here.
                    </p>
                    <ol className="list-decimal space-y-2 pl-4">
                      <li>
                        Open your bot in Telegram and press{" "}
                        <span className="text-foreground font-medium">
                          Start
                        </span>{" "}
                        (or send any message like &quot;hi&quot;). The bot
                        cannot message you until you start the chat.
                      </li>
                      <li>
                        Find your numeric ID. Easiest option: open Telegram,
                        search for{" "}
                        <span className="text-foreground font-medium">
                          @userinfobot
                        </span>
                        , start it, and it will show your{" "}
                        <span className="text-foreground font-medium">Id</span>{" "}
                        (a number like <code className="text-xs">123456789</code>
                        ).
                      </li>
                      <li>
                        Paste that number into the{" "}
                        <span className="text-foreground font-medium">
                          Where to send (Chat ID)
                        </span>{" "}
                        field. Do not add @.
                      </li>
                    </ol>
                    <p className="text-xs">
                      To message someone else: they must also Start your bot
                      first, then use <em>their</em> numeric ID (not yours).
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="message-channel">
                  <AccordionTrigger>
                    3. Message a public channel or group
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground space-y-3">
                    <p>
                      Only{" "}
                      <span className="text-foreground font-medium">
                        public
                      </span>{" "}
                      channels and groups can use a username like{" "}
                      <code className="text-xs">@my_channel</code>. Private ones
                      need a numeric ID instead.
                    </p>
                    <div className="space-y-2">
                      <p className="text-foreground text-sm font-medium">
                        Make a channel public (if it isn&apos;t already)
                      </p>
                      <ol className="list-decimal space-y-2 pl-4">
                        <li>
                          Open the channel → tap the name at the top →{" "}
                          <span className="text-foreground font-medium">
                            Edit
                          </span>{" "}
                          (or Manage Channel).
                        </li>
                        <li>
                          Set channel type to{" "}
                          <span className="text-foreground font-medium">
                            Public
                          </span>
                          .
                        </li>
                        <li>
                          Choose a public link / username (at least 5
                          characters, unique on Telegram). Example:{" "}
                          <code className="text-xs">@my_workflow_alerts</code>.
                        </li>
                      </ol>
                    </div>
                    <div className="space-y-2">
                      <p className="text-foreground text-sm font-medium">
                        Let your bot post there
                      </p>
                      <ol className="list-decimal space-y-2 pl-4">
                        <li>
                          In the channel, open{" "}
                          <span className="text-foreground font-medium">
                            Administrators
                          </span>
                          .
                        </li>
                        <li>
                          Add your bot as an admin and turn on{" "}
                          <span className="text-foreground font-medium">
                            Post Messages
                          </span>
                          .
                        </li>
                        <li>
                          Put the channel username (with @) into the Chat ID
                          field, e.g.{" "}
                          <code className="text-xs">@my_workflow_alerts</code>.
                        </li>
                      </ol>
                    </div>
                    <p className="text-xs">
                      Note: making a channel public means anyone with the link
                      can find and join it.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
