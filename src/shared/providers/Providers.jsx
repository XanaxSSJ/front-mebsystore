"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { createAppQueryClient } from "@/lib/query-client"
import MaterialSymbolsReady from "@/shared/components/MaterialSymbolsReady"

export default function Providers({ children }) {
    const [queryClient] = useState(createAppQueryClient)

    return (
        <QueryClientProvider client={queryClient}>
            <MaterialSymbolsReady />
            {children}
        </QueryClientProvider>
    )
}
