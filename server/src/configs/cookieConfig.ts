export const getCookieConfig = (maxAge: number = 15 * 60 * 1000) => ({ // 15 min
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge,
});
