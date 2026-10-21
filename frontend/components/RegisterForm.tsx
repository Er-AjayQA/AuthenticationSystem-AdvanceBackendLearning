"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { registerUser } from "@/lib/api";
import axios from "axios";
import { Turnstile } from "@marsidev/react-turnstile";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!captchaToken) {
      setError("Please complete the captcha");
      setLoading(false);
      return;
    }

    try {
      const data = await registerUser({
        email,
        password,
        confirmPassword,
        captchaToken,
      });
      console.log(data);
      setCaptchaToken("");
      setError("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error?.response?.data?.message || "Registration Failed");
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
        <h2 className="font-semibold">Create Account</h2>
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

        <Field>
          <FieldLabel>Confirm Password</FieldLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Field>

        <Field>
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
            onError={() => setCaptchaToken("")}
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Field>
          <Button variant="ghost" className="cursor-pointer" disabled={loading}>
            Sign Up
          </Button>
        </Field>
      </form>
    </div>
  );
};

export default RegisterForm;
