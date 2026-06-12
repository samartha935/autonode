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
import { LogInInput, logInSchema } from "@/features/auth/schemas";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const LogInCard = () => {
  const router = useRouter();
  const form = useForm<LogInInput>({
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: zodResolver(logInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LogInInput) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const OnOAuthSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-4xl font-extrabold">
          Log In
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
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
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
                    <div className="flex justify-end">
                      <Link
                        href={"/forgot-password"}
                        className="ml-1 text-center underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
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
                  Don&apos;t have an account?
                  <Link href={"/sign-up"} className="ml-1 underline">
                    Sign Up
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
          onClick={OnOAuthSignIn}
        >
          <FcGoogle className="size-8" />
          Google
        </Button>
      </CardContent>
    </Card>
  );
};

export default LogInCard;
