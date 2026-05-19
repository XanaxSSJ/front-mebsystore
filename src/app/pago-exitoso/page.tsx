"use client"

import { Suspense } from "react"
import PaymentSuccessPage from "@/features/orders/pages/PaymentSuccessPage"

export default function Page() {
    return (
        <Suspense fallback={null}>
            <PaymentSuccessPage />
        </Suspense>
    )
}
