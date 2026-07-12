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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GOOGLE_MODELS } from "@/config/ai-models";
import { CredentialType } from "@/db/schema";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
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
  credentialId: z.string().min(1, "Credential is required"),
  model: z.enum(GOOGLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export type GeminiFormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<GeminiFormValues>;
};

export const GeminiDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.GEMINI);

  const form = useForm<GeminiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
      model: defaultValues.model || GOOGLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
        model: defaultValues.model || GOOGLE_MODELS[0],
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myGemini";

  const handleSubmit = (values: GeminiFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <NodeConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Gemini Configuration"
      description="Run a Gemini chat completion. Select a saved API credential, pick a model, and write your prompts."
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
                    <Input placeholder="myGemini" {...field} />
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
                name="credentialId"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Gemini Credentials</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingCredentials || !credentials?.length}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            credentials?.length
                              ? "Select a credential"
                              : "No Gemini credentials yet"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {credentials?.map((credential) => (
                          <SelectItem key={credential.id} value={credential.id}>
                            <div className="flex items-center gap-2">
                              <Image
                                src="/logos/gemini.svg"
                                alt="Gemini"
                                width={16}
                                height={16}
                              />
                              {credential.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      API key stored under Credentials. Create one in the app if
                      the list is empty — see the setup guide.
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="model"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Model</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOOGLE_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Which Gemini model runs this completion. Match capability
                      and cost to your task.
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="systemPrompt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>System Prompt (optional)</FieldLabel>
                    <Textarea
                      placeholder="You are a helpful assistant."
                      className="min-h-20 font-mono text-sm"
                      {...field}
                    />
                    <FieldDescription>
                      Instructions for how the model should behave (tone, role,
                      constraints). Use {"{{variables}}"} or{" "}
                      {"{{json variable}}"} if needed.
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="userPrompt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>User Prompt</FieldLabel>
                    <Textarea
                      placeholder="Summarize this text: {{json httpResponse.data}}"
                      className="min-h-30 font-mono text-sm"
                      {...field}
                    />
                    <FieldDescription>
                      The main request sent to the model. Use {"{{variables}}"}{" "}
                      for simple values or {"{{json variable}}"} to stringify
                      objects from earlier nodes.
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
                value: "api-key",
                title: "1. Create an API key and credential",
                content: (
                  <>
                    <SetupSteps
                      steps={[
                        <>
                          Go to{" "}
                          <SetupEm>
                            Google AI Studio (aistudio.google.com)
                          </SetupEm>{" "}
                          → <SetupEm>Get API key</SetupEm> and create a key.
                          Copy it.
                        </>,
                        <>
                          In this app, open <SetupEm>Credentials</SetupEm> →{" "}
                          <SetupEm>New</SetupEm>, choose Gemini, give it a name,
                          and paste the key.
                        </>,
                        <>
                          Return here and select that credential from the{" "}
                          <SetupEm>Gemini Credentials</SetupEm> dropdown.
                        </>,
                      ]}
                    />
                    <p className="text-xs">
                      The key stays in your credentials store — do not put it in
                      the prompt fields.
                    </p>
                  </>
                ),
              },
              {
                value: "prompts",
                title: "2. System vs user prompt",
                content: (
                  <>
                    <ul className="list-disc space-y-2 pl-4">
                      <li>
                        <SetupEm>System</SetupEm> — stable rules (persona,
                        format, what to avoid). Optional.
                      </li>
                      <li>
                        <SetupEm>User</SetupEm> — the actual task for this run,
                        often including data from previous nodes.
                      </li>
                    </ul>
                    <p className="text-xs">
                      Example user prompt:{" "}
                      <SetupCode>
                        {"Extract key fields: {{json googleForm.responses}}"}
                      </SetupCode>
                    </p>
                  </>
                ),
              },
              {
                value: "output",
                title: "3. Using the model output later",
                content: (
                  <p>
                    The completion text is available as{" "}
                    <SetupCode>{`{{${watchVariableName}.text}}`}</SetupCode> in
                    later nodes (Discord, Telegram, HTTP body, etc.).
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
