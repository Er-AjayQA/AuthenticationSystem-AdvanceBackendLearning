"use client";

import { getOAuthGoogleUrl } from "@/lib/api";
import { Button } from "./ui/button";

const GoogleLoginbutton = () => {
  const handleGooglLogin = async () => {
    try {
      const googleUrl = await getOAuthGoogleUrl();
      window.location.href = googleUrl;
    } catch (error) {
      console.error(error);
      alert("Failed to start Google Login");
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="lg"
        className="w-full cursor-pointer font-medium bg-zinc-900 border border-zinc-700 p-5 transition hover:bg-zinc-800"
        onClick={handleGooglLogin}
      >
        Continue with Google
      </Button>
    </div>
  );
};

export default GoogleLoginbutton;
