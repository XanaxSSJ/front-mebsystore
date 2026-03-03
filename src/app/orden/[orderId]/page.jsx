"use client"

import { Suspense } from "react"
import OrderDetailPage from "@/features/orders/pages/OrderDetailPage"

export default function Page() {
    return (
        <Suspense fallback={null}>
            <OrderDetailPage />
        </Suspense>
    )
}
