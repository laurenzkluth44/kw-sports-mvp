import { SetPasswordForm } from "@/features/auth/set-password-form";

export default function SetPasswordPage() {
  return (
    <main className="kw-stripes flex min-h-screen items-center justify-center bg-brand-500 px-4 py-10">
      <div className="w-full max-w-md">
        <SetPasswordForm />
      </div>
    </main>
  );
}
