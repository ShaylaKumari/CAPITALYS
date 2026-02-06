import { Outlet } from "react-router-dom";
import { PreviewSidebar } from "@/components/PreviewSidebar";
import { PreviewHeader } from "@/components/PreviewHeader";

export default function PreviewLayout() {
  return (
    <div className="min-h-screen bg-background dark">
      <PreviewSidebar />
      <PreviewHeader />
      <main className="pl-64 pt-16">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
