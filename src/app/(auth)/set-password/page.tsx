import Image from "next/image";
import { SetPasswordForm } from "@/features/auth/set-password-form";

export default function SetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-12 w-36 items-center justify-center rounded-md bg-white px-3 py-2 shadow-soft">
            <Image
              src="/kw-sports-logo.png"
              alt="KW Sports"
              width={1000}
              height={326}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span>
            <span className="block font-black uppercase text-navy-950">Club Needs</span>
            <span className="block text-sm text-neutral-500">Zugang aktivieren</span>
          </span>
        </div>

        <SetPasswordForm />
      </div>
    </main>
  );
}
