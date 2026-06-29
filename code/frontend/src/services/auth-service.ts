import { authService as originalAuthService } from "./auth.service";
import { LoginInput } from "../schemas/login-schema";
import { RegisterInput } from "../schemas/register-schema";

// Re-export types if needed
export type { AuthResponse } from "./auth.service";

export const authService = {
  login: async (data: LoginInput) => {
    return originalAuthService.login(data);
  },

  register: async (data: { email: string; password?: string; fullName: string }) => {
    return originalAuthService.register(data as any);
  },

  verifyEmail: async (token: string) => {
    return originalAuthService.verifyEmail(token);
  }
};
