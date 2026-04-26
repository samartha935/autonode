import LogInCard from "@/components/custom/auth/LogInCard";
import { requireUnAuth } from "@/lib/auth-utils";

const page = async () => {
  await requireUnAuth();

  return <LogInCard />;
};

export default page;
