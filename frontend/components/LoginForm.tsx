"use client";

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { loginUser } from "@/lib/api";
import axios from "axios";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [showCaptcha, setShowCaptcha] = useState<boolean>(false);
  const captchaRef = useRef<TurnstileInstance>(undefined);
  const router = useRouter();

  const resetCaptcha = () => {
    setCaptchaToken("");
    captchaRef.current?.reset();
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    resetCaptcha();
    setShowCaptcha(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (showCaptcha && !captchaToken) {
      setError("Please complete the captcha");
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser({ email, password, captchaToken });
      console.log(data);
      resetForm();
      router.push("/dashboard");
    } catch (error) {
      if (captchaToken) {
        resetCaptcha();
      }

      if (axios.isAxiosError(error)) {
        const message = error?.response?.data?.message || "Login Failed";

        if (message === "Captcha is required") {
          setShowCaptcha(true);
          setError("Please complete the captcha");
          return;
        }

        setError(message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-zinc-500 rounded-xl p-4">
      <div className="mb-5">
        <h2 className="font-semibold">Welcome Back</h2>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {showCaptcha && (
          <Field>
            <Turnstile
              ref={captchaRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken("")}
              onError={() => setCaptchaToken("")}
            />
          </Field>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Field>
          <Button variant="ghost" className="cursor-pointer" disabled={loading}>
            Sign In
          </Button>
        </Field>
      </form>
    </div>
  );
};

export default LoginForm;
