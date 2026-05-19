"use client"

import ProfilePage from "@/features/user/pages/ProfilePage"
import AuthGuard from "@/features/auth/components/AuthGuard";

export default function Page() {
    return (
        <AuthGuard>
            <ProfilePage />
        </AuthGuard>
    )
}
