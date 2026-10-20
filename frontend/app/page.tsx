import AuthForm from "@/components/AuthForm";
import GoogleLoginbutton from "@/components/GoogleLoginButton";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Auth App</h1>
            <p className="mt-2 text-sm text-zinc-400">Sign in to continue</p>
          </div>
          <GoogleLoginbutton />

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-xs text-zinc-500">OR</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          <AuthForm />
        </div>
      </div>
    </main>
  );
}
