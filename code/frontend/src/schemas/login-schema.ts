import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
  password: z
    .string()
    .min(1, "Mật khẩu không được để trống")
    .min(8, "Mật khẩu phải có tối thiểu 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
