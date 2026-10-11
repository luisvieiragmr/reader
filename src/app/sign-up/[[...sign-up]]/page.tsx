import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#0c0c0c] px-5 py-12 text-[#f4f4f4]">
      <p className="mb-6 text-[1.75rem] font-semibold tracking-tight">Queue</p>
      <SignUp forceRedirectUrl="/" signInUrl="/sign-in" />
    </main>
  );
}
