import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";

// Both these functions only work if it's used in a server component. It can only be used to authenticate users in server component and not in client component. 

export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/log-in");
  }

  return session;
};

export const requireUnAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return session;
};
