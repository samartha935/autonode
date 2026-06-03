import VerifyEmailCard from "@/components/custom/auth/VerifyEmailCard";
import { requireUnAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireUnAuth();

  return (
    <div>
      <VerifyEmailCard />
    </div>
  );
};

export default Page;
