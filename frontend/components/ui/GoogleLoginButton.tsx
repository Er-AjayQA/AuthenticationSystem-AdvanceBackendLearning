"use client";

import { getOAuthGoogleUrl } from "@/lib/api";
import { Button } from "./button";

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
        className="cursor-pointer border border-white p-5"
        onClick={handleGooglLogin}
      >
        Continue with Google
      </Button>
    </div>
  );
};

export default GoogleLoginbutton;
