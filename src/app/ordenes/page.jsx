"use client"

import { Suspense } from "react"
import OrdersPage from "@/features/orders/pages/OrdersPage"

export default function Page() {
    return (
        <Suspense fallback={null}>
            <OrdersPage />
        </Suspense>
    )
}
