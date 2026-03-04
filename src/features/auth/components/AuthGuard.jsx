"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStatusQuery } from "@/features/auth/hooks/useAuthStatusQuery";

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: isAuthenticated,
    isLoading,
  } = useAuthStatusQuery();

  const redirectPath = pathname || "/";
  const shouldRedirect = !isLoading && isAuthenticated === false;

  useEffect(() => {
    if (!shouldRedirect) return;
    const redirect = encodeURIComponent(redirectPath);
    router.replace(`/login?redirect=${redirect}`);
  }, [shouldRedirect, redirectPath, router]);

  if (isLoading) return <FullPageSpinner />;

  if (shouldRedirect) return null;

  return children;
}

export default AuthGuard;