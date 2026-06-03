import SignUpCard from "@/components/custom/auth/SignUpCard";
import { requireUnAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireUnAuth();

  return <SignUpCard />;
};

export default Page;
