"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStatusQuery } from "@/features/auth/hooks/useAuthStatusQuery";
import { AuthGuardLoadingView } from "@/shared/components/page-skeletons";

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

  if (isLoading) return <AuthGuardLoadingView />;

  if (shouldRedirect) return null;

  return children;
}

export default AuthGuard;