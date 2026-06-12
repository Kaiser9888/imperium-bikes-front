"use client";

import { useAuth } from "@clerk/nextjs";

export function Authed({ children }: { children: React.ReactNode }) {
    const { isSignedIn } = useAuth();
    if (!isSignedIn) return null;
    return <>{children}</>;
}

export function Guest({ children }: { children: React.ReactNode }) {
    const { isSignedIn } = useAuth();
    if (isSignedIn) return null;
    return <>{children}</>;
}