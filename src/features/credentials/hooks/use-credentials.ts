import { useTRPC } from "@/trpc/client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@/db/schema/credential-schema";

/**
 * Hook to fetch all credentials using suspense
 */
export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

/**
 * Hook to fetch all credentials without suspending (for always-visible UI like pagination)
 */
export const useCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useQuery({
    ...trpc.credentials.getMany.queryOptions(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to create a new Credentials
 */
export const useCreateCredential = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credentials "${data.name}" created`);

        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions(params),
        );
      },
      onError: (error) => {
        toast.error(`Failed to create credentials: ${error.message}`);
      },
    }),
  );
};

/**
 * Hook to remove a credential.
 */

export const useRemoveCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credentials "${data.name}" removed.`);
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({}),
        );
      },
    }),
  );
};

/**
 * Hook to fetch one credential using suspense
 */

export const useSuspenseCredential = (credentialId: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.credentials.getOne.queryOptions({ credentialId }),
  );
};

/**
 * Hook to update a Credential.
 */

export const useUpdateCredential = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credentials "${data.name}" saved`);

        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({}),
        );
        queryClient.invalidateQueries(
          trpc.credentials.getOne.queryOptions({ credentialId: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to save credential: ${error.message}`);
      },
    }),
  );
};

/**
 * Hook to fetch credentials by type
 */

type CredentialType = (typeof CredentialType)[keyof typeof CredentialType];

export const useCredentialsByType = (type: CredentialType) => {
  const trpc = useTRPC();
  return useQuery(trpc.credentials.getByType.queryOptions({ type }));
};
