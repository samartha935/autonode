import VerifyEmailCard from "@/features/auth/components/VerifyEmailCard";
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
