"use client";

import { Suspense } from "react";
import AuthGuard from "@/features/auth/components/AuthGuard";
import OrdersPage from "@/features/orders/pages/OrdersPage";
import { OrdersPageSkeleton } from "@/shared/components/page-skeletons";

export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={<OrdersPageSkeleton />}>
        <OrdersPage />
      </Suspense>
    </AuthGuard>
  );
}