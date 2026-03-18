import { getQueryClient, trpc } from "@/trpc/server";
import {dehydrate, HydrationBoundary} from '@tanstack/react-query'
import { Suspense } from "react";
import { Client } from "./client";

export default async function Home() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(trpc.getUsers.queryOptions())


  return (
    <div className="flex h-screen items-center justify-center text-wrap mx-32">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>loading...</p>} >
         <Client/>
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
