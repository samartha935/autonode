import LogInCard from "@/components/custom/auth/LogInCard";
import { requireUnAuth } from "@/lib/auth-utils";

const page = async () => {
  await requireUnAuth();

  return (
    <div>
      <LogInCard />
    </div>
  );
};

export default page;
