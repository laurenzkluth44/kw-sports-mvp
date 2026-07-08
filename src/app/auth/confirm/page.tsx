import { AuthConfirm } from "@/features/auth/auth-confirm";

export default function AuthConfirmPage() {
  return (
    <main className="kw-stripes flex min-h-screen items-center justify-center bg-brand-500 px-4 py-10">
      <div className="w-full max-w-md">
        <AuthConfirm />
      </div>
    </main>
  );
}
