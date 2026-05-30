"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LogoutButton from "./logout";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

const Home = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data } = useQuery({ ...trpc.getWorkflows.queryOptions(), refetchInterval: 5_000 });

  const createWorkflow = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(trpc.getWorkflows.queryOptions()),
    }),
  );

  const deleteWorkflow = useMutation(trpc.deleteWorkflow.mutationOptions({
    onSuccess: () => queryClient.invalidateQueries(trpc.getWorkflows.queryOptions())
  })

  )

  return (
    <div className="mx-32 flex min-h-screen flex-col items-center justify-center gap-4 text-wrap">
      <div className="text-3xl font-bold">
        Protected Page. Requires Authentication.
      </div>
      <div>
        {data?.map((data, idx) => {
          return (<div key={idx} className="flex justify-center items-center gap-4">
            <div className="py-2">
              {JSON.stringify(data)}

            </div>
            <Button disabled={deleteWorkflow.isPending} onClick={() => deleteWorkflow.mutate({ id: data.id })}>Delete</Button>
          </div>
          );
        })}
      </div>

      <Button disabled={createWorkflow.isPending} onClick={() => createWorkflow.mutate()}>
        Create Workflow
      </Button>
      <LogoutButton />
    </div>
  );
};

export default Home;
