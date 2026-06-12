import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldSet } from "@/components/ui/field";

const ForgotPasswordCard = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full sm:max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Forgot Password?
          </CardTitle>
        </CardHeader>
        <CardContent>
            <form>
                <FieldSet>

                </FieldSet>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordCard;
