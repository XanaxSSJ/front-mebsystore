"use client"

import { Suspense } from "react"
import OrderDetailPage from "@/features/orders/pages/OrderDetailPage"
import { OrderDetailSkeleton } from "@/shared/components/page-skeletons"

export default function Page() {
    return (
        <Suspense fallback={<OrderDetailSkeleton />}>
            <OrderDetailPage />
        </Suspense>
    )
}
