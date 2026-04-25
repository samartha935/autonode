import SignUpCard from "@/components/custom/auth/SignUpCard";
import { requireUnAuth } from "@/lib/auth-utils";

const page = async () => {
  await requireUnAuth();

  return (
    <div>
      <SignUpCard />
    </div>
  );
};

export default page;
