import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect(...errors: (Error | null | undefined)[]) {
  const router = useRouter();

  useEffect(() => {
    const authError = errors.find(Boolean);
    if (
      authError &&
      (authError.message?.includes("401") || authError.message?.includes("Unauthorized"))
    ) {
      router.push("/login");
    }
  }, [...errors, router]);
}
