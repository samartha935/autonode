import { requireAuth } from "@/lib/auth-utils";

type PageProps = {
  params: Promise<{
    executionId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { executionId } = await params;
  return <div>Executions ID : {executionId}</div>;
};
export default Page;
