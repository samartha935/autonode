"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { router } from "better-auth/api";

const LogoutButton = () => {
  const router = useRouter();
  return (
    <div>
      <Button
        onClick={async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/log-in");
              },
            },
          });
        }}
      >
        Log Out
      </Button>
    </div>
  );
};

export default LogoutButton;

