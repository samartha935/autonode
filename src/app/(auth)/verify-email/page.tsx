import VerifyEmailCard from "@/components/custom/auth/VerifyEmailCard";
import { requireUnAuth } from "@/lib/auth-utils";

const page = async () => {
  await requireUnAuth();

  return (
    <div>
      <VerifyEmailCard />
    </div>
  );
};

export default page;
