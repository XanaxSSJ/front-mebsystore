"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import MaterialSymbolsReady from "@/shared/components/MaterialSymbolsReady"

export default function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <MaterialSymbolsReady />
            {children}
        </QueryClientProvider>
    )
}
