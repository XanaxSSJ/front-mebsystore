"use client";

import { Suspense } from "react";
import AuthGuard from "@/features/auth/components/AuthGuard";
import CheckoutPage from "@/features/checkout/pages/CheckoutPage";

export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <CheckoutPage />
      </Suspense>
    </AuthGuard>
  );
}