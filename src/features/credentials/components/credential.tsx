"use client";

import { CredentialType, credentialTypeEnum } from "@/db/schema";
import { useRouter } from "next/navigation";
import {
  useCreateCredential,
  useSuspenseCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";
import useUpgradeModal from "@/features/billing/hooks/use-upgrade-modal";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CredentialFormProps = {
  initialData?: {
    id?: string;
    name: string;
    type: (typeof CredentialType)[keyof typeof CredentialType];
    value: string;
  };
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(credentialTypeEnum.enumValues),
  value: z.string().min(1, "API key is required"),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/logos/openai.svg",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/logos/anthropic.svg",
  },
  {
    value: CredentialType.GEMINI,
    label: "Gemini",
    logo: "/logos/gemini.svg",
  },
];

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();

  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: CredentialType.OPENAI,
      value: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync(
        {
          credentialId: initialData.id,
          ...values,
        },
        {
          onError: (error) => {
            handleError(error);
          },
          onSuccess: (data) => {
            router.push(`/credentials/${data.id}`);
          },
        },
      );
    } else {
      await createCredential.mutateAsync(values, {
        onError: (error) => {
          handleError(error);
        },
        onSuccess: (data) => {
          router.push(`/credentials/${data.id}`);
        },
      });
    }
  };

  return (
    <>
      {modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Credential" : "Create Credential"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Update your API key or credential details"
              : "Add a new API key or credential to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldSet>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input placeholder="My API key" {...field} />

                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="type"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger><SelectContent>
                        {credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={16}
                                height={16}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                      </Select>
                      

                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="value"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Value</FieldLabel>
                      <Input placeholder="sk-..." type="password" {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <CardFooter className="mt-4">
                  <Button
                    type="submit"
                    disabled={
                      createCredential.isPending || updateCredential.isPending
                    }
                  >
                    {isEdit ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant={"outline"} asChild>
                    <Link href={"/credentials"}>Cancel</Link>
                  </Button>
                </CardFooter>
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data: credential } = useSuspenseCredential(credentialId);

  return (
    <CredentialForm
      initialData={{
        id: credential.id,
        name: credential.name,
        value: credential.value,
        type: credential.type ?? "GEMINI",
      }}
    />
  );
};
