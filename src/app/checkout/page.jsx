"use client"

import { Suspense } from "react"
import CheckoutPage from "@/features/checkout/pages/CheckoutPage"

export default function Page() {
    return (
        <Suspense fallback={null}>
            <CheckoutPage />
        </Suspense>
    )
}
