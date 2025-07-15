import { useRefreshTokenMutation } from "@/store/features/auth/authApi";
import { setCredentials } from "@/store/features/slice/UserAuthSlice";
import { useAppDispatch } from "@/store/hook";
import { useEffect, useState } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const dispatch = useAppDispatch();
  const { data, isSuccess, isLoading } = useRefreshTokenMutation();

  useEffect(() => {
    if (isSuccess && data?.accessToken && data?.user) {
      dispatch(setCredentials({ user: data.user, token: data.accessToken }));
    }
    if (!isLoading) setReady(true);
  }, [isSuccess, isLoading]);

  if (!ready) return <div>Authenticating...</div>;
  return <>{children}</>;
};
