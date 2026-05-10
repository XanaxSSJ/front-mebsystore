"use client";

import { Suspense } from "react";
import AuthGuard from "@/features/auth/components/AuthGuard";
import CheckoutPage from "@/features/checkout/pages/CheckoutPage";
import { CheckoutPageSkeleton } from "@/shared/components/page-skeletons";

export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={<CheckoutPageSkeleton />}>
        <CheckoutPage />
      </Suspense>
    </AuthGuard>
  );
}