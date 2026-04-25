import z, { email } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .pipe(z.email("please enter a valid email address."))
  .transform((val) => val.toLowerCase());
//Did string check and trim and min(1) before checking email format because to get proper error when user just enters " " or doesn't enter anything at all. Just email check displays error as "Invalid email format."

export const usernameSchema = z
  .string()
  .trim()
  .min(2, "Name must at least be of 2 characters.")
  .max(50, "Name is too long.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password is too long.")
  .regex(/[A-Z]/, "At least one uppercase letter required.")
  .regex(/[a-z]/, "At least one lowercase letter required.")
  .regex(/[0-9]/, "At least one number required.")
  .regex(/[^A-Za-z0-9]/, "At least one special character required.");
// .superRefine((val, ctx) => {
//   if (
//     val.includes("123") ||
//     val.includes("password") ||
//     val.includes("asdf") ||
//     val.includes("qwert")
//   ) {
//     ctx.addIssue({
//       code: "custom",
//       message: "Password is too weak.",
//     });
//   }
// });

// superRefine() is just the more advanced version of refine(), where it gives more control on things.

export const logInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match.",
  });

export type LogInInput = z.infer<typeof logInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
