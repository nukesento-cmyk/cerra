import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const PerfumeCreateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.string().min(1),
  priceValue: z.number().int().nonnegative(),
  imageUrl: z.string().min(1),
  collection: z.enum(["women", "men", "unisex"]),
  notes: z.array(z.string().min(1)).min(1),
});

export const PostCreateSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    title: z.string().min(1).max(200),
    excerpt: z.string().min(1).max(400),
    content: z.string().min(1),
    coverImage: z.string().min(1).optional().nullable(),
    published: z.boolean().default(false),
  });
  
  export const PostUpdateSchema = PostCreateSchema.partial();
export const PerfumeUpdateSchema = PerfumeCreateSchema.partial();
