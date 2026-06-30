import LoginPage from "@/pages/auth/login-page";
import { PublicRoute } from "@/components/auth/public-route";

export default function Page() {
  return (
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  );
}