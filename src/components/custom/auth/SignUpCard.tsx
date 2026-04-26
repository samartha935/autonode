"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SignUpInput, signUpSchema } from "@/zod-schema/auth-schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SignUpCard = () => {
  const router = useRouter();
  const form = useForm<SignUpInput>({
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    await authClient.signUp.email(
      {
        name: data.username,
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
          toast.message("Welcome!!!");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-4xl font-extrabold">
          Sign Up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="email-input">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email-input"
                      placeholder="Joe@email.com"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="username-input">Username</FieldLabel>
                    <Input
                      {...field}
                      id="username-input"
                      placeholder="Joe Doe"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="password-input">Password</FieldLabel>
                    <Input
                      {...field}
                      id="password-input"
                      placeholder="********"
                      type="password"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="confirmPassword-input">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword-input"
                      type="password"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer py-6 text-lg"
                  disabled={form.formState.isSubmitting}
                >
                  Submit
                </Button>
                <div className="py-1 text-center">
                  Already have an account?
                  <Link href={"/log-in"} className="ml-1 underline">
                    Log In
                  </Link>
                </div>
              </div>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
      <Separator />
      <CardContent>
        <Button
          variant={"outline"}
          className="w-full cursor-pointer py-6 text-lg"
          disabled={form.formState.isSubmitting}
        >
          <FcGoogle className="size-[32px]" />
          Google
        </Button>
      </CardContent>
    </Card>
  );
};

export default SignUpCard;
