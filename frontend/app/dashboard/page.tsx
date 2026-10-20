"use client";

import { BACKEND_URL } from "@/lib/api";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const DashboardPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        const tokenResponse = await axios.post(
          `${BACKEND_URL}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const accessToken = tokenResponse?.data?.data?.accessToken;

        const userResponse = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setUser(userResponse?.data?.data);
      } catch (error) {
        console.log(error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <div>
        <h3>Loading .....</h3>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h3>User not found</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen gap-2">
      <h1 className="text-2xl">Dashboard</h1>
      <p className="text-xl">{`Welcome to the dashboard ${user.email}`}</p>
    </div>
  );
};

export default DashboardPage;
