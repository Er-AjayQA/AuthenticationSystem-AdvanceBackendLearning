import axios from "axios";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getOAuthGoogleUrl = async () => {
  const res = await axios.get(`${BACKEND_URL}/auth/google`, {
    withCredentials: true,
  });

  const googleOAuthUrl = res?.data?.data?.url;
  return googleOAuthUrl;
};
