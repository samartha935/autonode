import SignUpCard from "@/features/auth/components/SignUpCard";
import { requireUnAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireUnAuth();

  return <SignUpCard />;
};

export default Page;
