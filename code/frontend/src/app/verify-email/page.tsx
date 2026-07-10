import VerifyEmailPage from "@/pages/auth/verify-email-page";
import { PublicRoute } from "@/components/auth/public-route";

export default function Page() {
  return (
    <PublicRoute>
      <VerifyEmailPage />
    </PublicRoute>
  );
}