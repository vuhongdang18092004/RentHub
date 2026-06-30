import RegisterPage from "@/pages/auth/register-page";
import { PublicRoute } from "@/components/auth/public-route";

export default function Page() {
  return (
    <PublicRoute>
      <RegisterPage />
    </PublicRoute>
  );
}