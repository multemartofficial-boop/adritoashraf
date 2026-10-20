import { z } from "zod";
import { fdString } from "@/lib/forms";

const name = z.string().trim().min(2, "Please enter your name.").max(120, "Name is too long.");
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ error: "Enter a valid email address." }));

/** Public gift-page signup (name + email). */
export const leadSchema = z.object({
  name,
  email,
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60),
});
export type LeadInput = z.infer<typeof leadSchema>;

/** Admin: add/edit a contact by hand. Email or phone — at least one is required. */
export const contactSchema = z
  .object({
    name,
    email: z.union([z.literal(""), email]).default(""),
    phone: z.string().trim().max(40, "Phone is too long."),
    notes: z.string().trim().max(2000, "Keep notes under 2000 characters."),
  })
  .superRefine((v, ctx) => {
    if (!v.email && !v.phone) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Add an email or a phone number." });
    }
  });
export type ContactInput = z.infer<typeof contactSchema>;

export const parseContact = (fd: FormData) =>
  contactSchema.safeParse({
    name: fdString(fd, "name"),
    email: fdString(fd, "email"),
    phone: fdString(fd, "phone"),
    notes: fdString(fd, "notes"),
  });
