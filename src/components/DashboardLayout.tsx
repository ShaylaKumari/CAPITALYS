import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type SidebarIndicators = { selic?: string; ipca?: string; pib?: string };

const fmtPct = (v: number | null | undefined) =>
  v == null ? "--" : `${v.toFixed(2).replace(".", ",")}%`;

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop

  const [sidebarIndicators, setSidebarIndicators] = useState<SidebarIndicators>({
    selic: "--",
    ipca: "--",
    pib: "--",
  });

  useEffect(() => {
    const loadSidebarIndicators = async () => {
      const { data, error } = await supabase
        .from("view_latest_indicator_analysis")
        .select("indicator_type,current_value");

      if (error) {
        console.error("sidebar indicators error:", error);
        return;
      }

      const selic = data?.find((x) => x.indicator_type === "selic")?.current_value ?? null;
      const ipca = data?.find((x) => x.indicator_type === "ipca")?.current_value ?? null;
      const pib =
        data?.find((x) => x.indicator_type === "pib_crescimento")?.current_value ?? null;

      setSidebarIndicators({
        selic: fmtPct(selic),
        ipca: fmtPct(ipca),
        pib: fmtPct(pib),
      });
    };

    loadSidebarIndicators();
  }, []);

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <DashboardSidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        indicators={sidebarIndicators}
      />

      {/* botões */}
      <div className="fixed top-20 left-4 z-40 flex gap-2">
        {/* mobile */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>

        {/* desktop */}
        <Button
          variant="outline"
          size="icon"
          className="hidden md:inline-flex"
          onClick={() => setCollapsed((v) => !v)}
          aria-label="Alternar sidebar"
        >
          {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
        </Button>
      </div>

      {/* conteúdo */}
      <main
        className={cn(
          "pt-24 pb-12 transition-all",
          collapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
