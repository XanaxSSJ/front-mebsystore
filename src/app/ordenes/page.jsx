"use client";

import { Suspense } from "react";
import AuthGuard from "@/features/auth/components/AuthGuard";
import OrdersPage from "@/features/orders/pages/OrdersPage";

export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <OrdersPage />
      </Suspense>
    </AuthGuard>
  );
}