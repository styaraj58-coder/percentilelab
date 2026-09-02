"use server";

import { sendEnquiryNotification } from "@/lib/email";
import { enquirySchema } from "@/lib/validation";

export type EnquiryState = { error?: string; success?: boolean } | undefined;

export async function submitEnquiry(
  _prevState: EnquiryState,
  formData: FormData
): Promise<EnquiryState> {
  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await sendEnquiryNotification(parsed.data);

  return { success: true };
}
