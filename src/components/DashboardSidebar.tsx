import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Plus,
  User as UserIcon,
  TrendingUp,
  ChevronLeft,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meus Objetivos", url: "/objetivos", icon: Target },
  { title: "Criar Objetivo", url: "/novo-objetivo", icon: Plus },
  { title: "Meu Perfil", url: "/perfil", icon: UserIcon },
];

type Props = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  indicators?: { selic?: string; ipca?: string; pib?: string };
};

export function DashboardSidebar({ open, collapsed, onClose, indicators }: Props) {
  const location = useLocation();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-[60] h-screen bg-card border-r border-border flex flex-col transition-all",
          // largura
          collapsed ? "w-20" : "w-64",
          // mobile: slide in/out
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Top */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <Logo className="h-8" />
          </Link>

          {/* Close no mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => {
                  // fecha no mobile ao navegar
                  if (window.innerWidth < 768) onClose();
                }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Indicadores */}
        <div className="px-4 py-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" />
            {!collapsed && "Indicadores"}
          </p>

          {!collapsed && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Selic</span>
                <span className="text-chart-selic font-medium">
                  {indicators?.selic ?? "--"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IPCA</span>
                <span className="text-chart-ipca font-medium">
                  {indicators?.ipca ?? "--"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PIB</span>
                <span className="text-chart-pib font-medium">
                  {indicators?.pib ?? "--"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Voltar */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/">
              <ChevronLeft className="h-4 w-4 mr-2" />
              {!collapsed ? "Voltar ao Site" : "Voltar"}
            </Link>
          </Button>
        </div>
      </aside>
    </>
  );
}
