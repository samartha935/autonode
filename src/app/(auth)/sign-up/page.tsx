import SignUpCard from "@/components/custom/auth/SignUpCard";
import { requireUnAuth } from "@/lib/auth-utils";

const page = async () => {
  await requireUnAuth();

  return <SignUpCard />;
};

export default page;
