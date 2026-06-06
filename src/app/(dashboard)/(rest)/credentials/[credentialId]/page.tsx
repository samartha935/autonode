import { requireAuth } from "@/lib/auth-utils";

type PageProps = {
  params: Promise<{
    credentialId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { credentialId } = await params;
  return <div>Credential ID : {credentialId}</div>;
};
export default Page;
