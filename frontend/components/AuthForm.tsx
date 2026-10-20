"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Button } from "./ui/button";

const AuthForm = () => {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="border border-zinc-500 rounded-2xl p-5">
      <div className="flex items-center justify-center mb-5">
        <Button
          variant={"ghost"}
          onClick={() => setMode("login")}
          className={`${mode === "login" ? "bg-zinc-300 text-zinc-900" : "bg-zinc-800 text-zinc-200"} hover:bg-zinc-300 flex-1`}
        >
          Login
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => setMode("register")}
          className={`${mode === "register" ? "bg-zinc-300 text-zinc-900" : "bg-zinc-800 text-zinc-200"} hover:bg-zinc-300 flex-1`}
        >
          Register
        </Button>
      </div>

      {mode === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
};

export default AuthForm;
