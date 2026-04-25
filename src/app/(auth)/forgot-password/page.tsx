import ForgotPasswordCard from "@/components/custom/auth/ForgotPasswordCard";
import { requireUnAuth } from "@/lib/auth-utils";

const page = async () => {
 await requireUnAuth()

  return (
    <div>
      <ForgotPasswordCard />
    </div>
  );
};

export default page;
