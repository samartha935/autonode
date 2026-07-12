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
  endpoint: z.url({ message: "Please enter a valid URL." }),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  body: z.string().optional(),
});

export type HttpRequestFormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<HttpRequestFormValues>;
};

export const HttpRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<HttpRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      endpoint: defaultValues.endpoint || "",
      method: defaultValues.method || "GET",
      body: defaultValues.body || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        endpoint: defaultValues.endpoint || "",
        method: defaultValues.method || "GET",
        body: defaultValues.body || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myApiCall";
  const watchMethod = form.watch("method");
  const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod);

  const handleSubmit = (values: HttpRequestFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <NodeConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="HTTP Request"
      description="Call any HTTP API. Choose a method and URL; optionally send a JSON body. Use the response in later nodes via the variable name."
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
                    <Input placeholder="myApiCall" {...field} />
                    <FieldDescription>
                      Use this name to reference the result in other nodes:{" "}
                      {`{{${watchVariableName}.httpResponse.data}}`}
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="method"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Method</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      GET to read data; POST/PUT/PATCH to send a body; DELETE to
                      remove a resource. Match what the API documents.
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="endpoint"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Endpoint URL</FieldLabel>
                    <Input
                      placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                      {...field}
                    />
                    <FieldDescription>
                      Full URL including <SetupCode>https://</SetupCode>. You
                      can embed {"{{variables}}"} in the path or query string.
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {showBodyField && (
                <Controller
                  name="body"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Request Body</FieldLabel>
                      <Textarea
                        placeholder={`{\n  "userId": "{{httpResponse.data.id}}",\n  "name": "{{httpResponse.data.name}}",\n  "items": {{json httpResponse.data.items}}\n}`}
                        className="min-h-30 font-mono text-sm"
                        {...field}
                      />
                      <FieldDescription>
                        JSON body for this request. Use {"{{variables}}"} for
                        simple values or {"{{json variable}}"} to insert objects
                        without extra quotes.
                      </FieldDescription>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
            </FieldGroup>
          </FieldSet>

          <NodeSetupGuide
            sections={[
              {
                value: "method-url",
                title: "1. Choosing method and URL",
                content: (
                  <>
                    <SetupSteps
                      steps={[
                        <>
                          Read the API docs for the endpoint you need (path,
                          method, and whether a body is required).
                        </>,
                        <>
                          Paste the full URL into <SetupEm>Endpoint URL</SetupEm>
                          , including scheme and host (e.g.{" "}
                          <SetupCode>https://api.example.com/v1/items</SetupCode>
                          ).
                        </>,
                        <>
                          Set <SetupEm>Method</SetupEm> to match the docs. The
                          body field only appears for POST, PUT, and PATCH.
                        </>,
                      ]}
                    />
                    <p className="text-xs">
                      Query params can go on the URL:{" "}
                      <SetupCode>
                        {"https://api.example.com/search?q={{query}}"}
                      </SetupCode>
                      .
                    </p>
                  </>
                ),
              },
              {
                value: "variables",
                title: "2. Using variables in URL or body",
                content: (
                  <>
                    <p>
                      Insert outputs from earlier nodes with Handlebars-style
                      templates:
                    </p>
                    <ul className="list-disc space-y-1 pl-4">
                      <li>
                        Strings / numbers:{" "}
                        <SetupCode>{"{{myOpenAi.text}}"}</SetupCode>
                      </li>
                      <li>
                        Nested fields:{" "}
                        <SetupCode>
                          {"{{stripe.customerId}}"}
                        </SetupCode>
                      </li>
                      <li>
                        Whole objects in JSON:{" "}
                        <SetupCode>{"{{json httpResponse.data}}"}</SetupCode>
                      </li>
                    </ul>
                    <p className="text-xs">
                      Use <SetupCode>{"{{json ...}}"}</SetupCode> inside a JSON
                      body when the value is an object or array so you do not
                      wrap it in extra quotes.
                    </p>
                  </>
                ),
              },
              {
                value: "response",
                title: "3. Reading the response in later nodes",
                content: (
                  <>
                    <p>
                      After this node runs, later steps can use the variable
                      name you chose (e.g. <SetupCode>myApiCall</SetupCode>):
                    </p>
                    <ul className="list-disc space-y-1 pl-4">
                      <li>
                        <SetupCode>
                          {`{{${watchVariableName}.httpResponse.data}}`}
                        </SetupCode>{" "}
                        — parsed response body
                      </li>
                      <li>
                        Nested fields depend on the API shape, e.g.{" "}
                        <SetupCode>
                          {`{{${watchVariableName}.httpResponse.data.id}}`}
                        </SetupCode>
                      </li>
                    </ul>
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
