import ForgotPasswordCard from "@/features/auth/components/ForgotPasswordCard";
import { requireUnAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireUnAuth();

  return (
    <div>
      <ForgotPasswordCard />
    </div>
  );
};

export default Page;
