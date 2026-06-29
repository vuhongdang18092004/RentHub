import { z } from "zod";

export const ProfileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ (ví dụ: 0912345678)"),
  address: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
