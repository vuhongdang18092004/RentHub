import { z } from "zod";

export const RegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Họ và tên không được để trống")
      .min(2, "Họ và tên phải có tối thiểu 2 ký tự"),
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
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;
