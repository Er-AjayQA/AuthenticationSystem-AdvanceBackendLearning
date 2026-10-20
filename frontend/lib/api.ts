import axios from "axios";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getOAuthGoogleUrl = async () => {
  const res = await axios.get(`${BACKEND_URL}/auth/google`, {
    withCredentials: true,
  });

  const googleOAuthUrl = res?.data?.data?.url;
  return googleOAuthUrl;
};

interface RegisterUserInput {
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterUserInput) {
  const response = await axios.post(
    `${BACKEND_URL}/api/v1/auth/register-user`,
    data,
  );

  return response.data;
}

export async function loginUser(data: LoginUserInput) {
  const response = await axios.post(
    `${BACKEND_URL}/api/v1/auth/login-user`,
    data,
  );

  return response.data;
}
