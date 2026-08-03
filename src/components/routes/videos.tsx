import { createFileRoute, Outlet } from "@tanstack/react-router";
import { VideosHeader, MobileNav } from "@/components/videos/VideosNavigation";

export const Route = createFileRoute("/videos")({
    component: VideosLayout,
});

function VideosLayout() {
    return (
        <div className="min-h-screen bg-background">
            <VideosHeader />
            <main className="pb-24 lg:pb-0">
                <Outlet />
            </main>
            <MobileNav />
        </div>
    );
}
