import { caller, getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { Client } from "./client";
import { requireAuth } from "@/lib/auth-utils";
import LogoutButton from "./logout";

const Home = async () => {
  // const queryClient = getQueryClient()

  // void queryClient.prefetchQuery(trpc.getUsers.queryOptions())

  await requireAuth();

  const users = await caller.getUsers();

  return (
    <div className="mx-32 flex h-screen flex-col items-center justify-center text-wrap">
      {/* <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>loading...</p>} >
         <Client/>
        </Suspense>
      </HydrationBoundary> */}

      <div className="text-3xl font-bold">
        Protected Page. Requires Authentication.
      </div>
      <div>
        {users.map((user, idx) => {
          return (
            <div key={idx} className="py-2">
              {JSON.stringify(user)} 
            </div>
          );
        })}
      </div>
      <LogoutButton />
    </div>
  );
};

export default Home;
