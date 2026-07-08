"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import type { AppRole } from "@/types/domain";

const VALID_ROLES: AppRole[] = ["admin", "club", "agency"];

export type InviteUserActionState = {
  status: "idle" | "sent" | "manual" | "error";
  message?: string;
  detail?: string;
  actionLink?: string;
  email?: string;
};

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "") as AppRole;
  const clubId = String(formData.get("club_id") || "").trim() || null;
  const agencyName = String(formData.get("agency_name") || "").trim() || null;

  if (!name || !email || !password || !VALID_ROLES.includes(role)) {
    redirect("/admin/users?error=validation");
  }

  if (role === "club" && !clubId) {
    redirect("/admin/users?error=club");
  }

  if (role === "agency" && !agencyName) {
    redirect("/admin/users?error=agency");
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        club_id: role === "club" ? clubId : null,
        agency_name: role === "agency" ? agencyName : null
      }
    });

    if (authError || !data.user) throw authError;

    const { error: profileError } = await adminClient.from("users").insert({
      id: data.user.id,
      name,
      email,
      role,
      club_id: role === "club" ? clubId : null,
      agency_name: role === "agency" ? agencyName : null
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(data.user.id);
      throw profileError;
    }
  } catch {
    redirect("/admin/users?error=service");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function inviteUserAction(
  _state: InviteUserActionState,
  formData: FormData
): Promise<InviteUserActionState> {
  await requireAdmin();

  const name = String(formData.get("invite_name") || "").trim();
  const email = String(formData.get("invite_email") || "").trim().toLowerCase();
  const role = String(formData.get("invite_role") || "") as AppRole;
  const clubId = String(formData.get("invite_club_id") || "").trim() || null;
  const agencyName = String(formData.get("invite_agency_name") || "").trim() || null;
  const logoDataUrl = String(formData.get("invite_logo") || "");

  if (!name || !email || !VALID_ROLES.includes(role)) {
    return {
      status: "error",
      message: "Bitte alle Pflichtfelder ausfüllen."
    };
  }

  if (role === "club" && !clubId) {
    return {
      status: "error",
      message: "Club User benötigen einen Verein."
    };
  }

  if (role === "agency" && !agencyName) {
    return {
      status: "error",
      message: "Agency User benötigen einen Agency-Namen."
    };
  }

  let adminClient: ReturnType<typeof createSupabaseAdminClient>;

  try {
    adminClient = createSupabaseAdminClient();
  } catch (error) {
    console.error("Invite configuration error", error);
    return {
      status: "error",
      message: "Einladung konnte nicht gesendet werden. Service Role Key oder Supabase URL fehlt.",
      detail: getInviteErrorMessage(error)
    };
  }

  const existingProfile = await findExistingProfileByEmail(adminClient, email);
  if (existingProfile.error) {
    return {
      status: "error",
      message: "Bestehende Nutzer konnten nicht geprüft werden.",
      detail: getInviteErrorMessage(existingProfile.error)
    };
  }
  if (existingProfile.id) {
    return {
      status: "error",
      message: "Für diese E-Mail existiert bereits ein Nutzer. Bitte Zugang prüfen oder den alten Zugang revoken."
    };
  }

  const metadata = {
    name,
    role,
    club_id: role === "club" ? clubId : null,
    agency_name: role === "agency" ? agencyName : null
  };
  const redirectTo = `${getSiteUrl()}/set-password`;

  try {
    const { data, error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: metadata,
      redirectTo
    });

    if (authError || !data.user) throw authError;

    const profileError = await createInvitedProfile(adminClient, data.user.id, name, email, role, clubId, agencyName);

    if (profileError) {
      if (profileError.code === "23505") {
        console.error("Invite profile conflict", profileError);
        throw new Error("User already exists");
      }

      await adminClient.auth.admin.deleteUser(data.user.id);
      throw profileError;
    }

    if (role === "club" && clubId) {
      await uploadClubLogoFromDataUrl(adminClient, clubId, logoDataUrl);
    }

    revalidatePath("/admin/users");
    return {
      status: "sent",
      email
    };
  } catch (error) {
    console.error("Invite user error", error);
    const fallback = await createManualInviteLink(adminClient, {
      name,
      email,
      role,
      clubId,
      agencyName,
      logoDataUrl,
      metadata,
      redirectTo,
      originalError: error
    });

    revalidatePath("/admin/users");
    return fallback;
  }
}

const CLUB_LOGO_BUCKET = "club-logos";
const MAX_LOGO_BYTES = 2_000_000;

// Best-effort: store the (already browser-compressed) logo for a club and record its path.
// Never throws — a logo problem must not undo a successful invite.
async function uploadClubLogoFromDataUrl(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  clubId: string,
  logoDataUrl: string
) {
  if (!logoDataUrl) return;

  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(logoDataUrl);
  if (!match) return;

  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_LOGO_BYTES) {
    console.error("Club logo rejected (empty or too large)", { clubId, bytes: buffer.byteLength });
    return;
  }

  const path = `${clubId}/logo.webp`;

  const { error: uploadError } = await adminClient.storage.from(CLUB_LOGO_BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
    cacheControl: "3600"
  });

  if (uploadError) {
    console.error("Club logo upload failed", uploadError);
    return;
  }

  const { error: updateError } = await adminClient.from("clubs").update({ logo_path: path }).eq("id", clubId);
  if (updateError) console.error("Club logo path update failed", updateError);
}

async function findExistingProfileByEmail(adminClient: ReturnType<typeof createSupabaseAdminClient>, email: string) {
  const { data, error } = await adminClient.from("users").select("id").eq("email", email).maybeSingle();
  return { id: data?.id as string | undefined, error };
}

async function createInvitedProfile(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  name: string,
  email: string,
  role: AppRole,
  clubId: string | null,
  agencyName: string | null
) {
  const { error } = await adminClient.from("users").insert({
    id: userId,
    name,
    email,
    role,
    club_id: role === "club" ? clubId : null,
    agency_name: role === "agency" ? agencyName : null
  });

  return error;
}

async function createManualInviteLink(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  input: {
    name: string;
    email: string;
    role: AppRole;
    clubId: string | null;
    agencyName: string | null;
    logoDataUrl: string;
    metadata: { name: string; role: AppRole; club_id: string | null; agency_name: string | null };
    redirectTo: string;
    originalError: unknown;
  }
): Promise<InviteUserActionState> {
  const originalDetail = getInviteErrorMessage(input.originalError);

  try {
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: "invite",
      email: input.email,
      options: {
        data: input.metadata,
        redirectTo: input.redirectTo
      }
    });

    if (error || !data.user || !data.properties?.action_link) throw error;

    const profileError = await createInvitedProfile(
      adminClient,
      data.user.id,
      input.name,
      input.email,
      input.role,
      input.clubId,
      input.agencyName
    );

    if (profileError) {
      await adminClient.auth.admin.deleteUser(data.user.id);
      throw profileError;
    }

    if (input.role === "club" && input.clubId) {
      await uploadClubLogoFromDataUrl(adminClient, input.clubId, input.logoDataUrl);
    }

    return {
      status: "manual",
      email: input.email,
      actionLink: data.properties.action_link,
      detail: originalDetail
    };
  } catch (fallbackError) {
    console.error("Manual invite link fallback error", fallbackError);
    const fallbackDetail = getInviteErrorMessage(fallbackError);
    return {
      status: "error",
      message: getInviteErrorMessageForUser(input.originalError),
      detail: [originalDetail, fallbackDetail].filter(Boolean).join(" | ")
    };
  }
}

function getInviteErrorMessageForUser(error: unknown) {
  const code = getInviteErrorCode(error);
  if (code === "invite_exists") {
    return "Für diese E-Mail existiert bereits ein Nutzer. Bitte Zugang prüfen oder den alten Zugang revoken.";
  }
  if (code === "invite_url") {
    return "Supabase hat die Redirect URL abgelehnt. Bitte Site URL und Redirect URLs prüfen.";
  }
  if (code === "invite_smtp") {
    return "Supabase konnte die E-Mail nicht senden. Bitte SMTP, Sender-Adresse und Rate Limits prüfen.";
  }
  return "Einladung konnte nicht gesendet werden. Supabase Auth, SMTP und Site URL prüfen.";
}

function getInviteErrorCode(error: unknown) {
  const message = getInviteErrorMessage(error).toLowerCase();

  if (message.includes("already") || message.includes("registered") || message.includes("exists")) return "invite_exists";
  if (message.includes("redirect") || message.includes("site url") || message.includes("not allowed")) return "invite_url";
  if (
    message.includes("smtp") ||
    message.includes("mailer") ||
    message.includes("mail") ||
    message.includes("email address not authorized") ||
    message.includes("email provider") ||
    message.includes("sending invite") ||
    message.includes("sending email") ||
    message.includes("send an email") ||
    message.includes("rate limit") ||
    message.includes("send email")
  ) {
    return "invite_smtp";
  }

  return "invite";
}

function getInviteErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const maybeMessage = "message" in error ? String(error.message) : "";
    const maybeCode = "code" in error ? String(error.code) : "";
    const maybeStatus = "status" in error ? String(error.status) : "";
    return [maybeMessage, maybeCode, maybeStatus].filter(Boolean).join(" ");
  }

  return String(error || "");
}
