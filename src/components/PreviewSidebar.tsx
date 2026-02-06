import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Target, 
  Plus, 
  User, 
  TrendingUp,
  ChevronLeft,
  Eye
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navItems = [
  { title: "Dashboard", url: "/preview/dashboard", icon: LayoutDashboard },
  { title: "Meus Objetivos", url: "/preview/objetivos", icon: Target },
  { title: "Criar Objetivo", url: "/preview/novo-objetivo", icon: Plus },
  { title: "Meu Perfil", url: "/preview/perfil", icon: User },
];

export function PreviewSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/preview/dashboard" className="flex items-center gap-2">
          <Logo className="h-8" />
        </Link>
      </div>

      {/* Preview Badge */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/20 border border-accent/30">
          <Eye className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-accent">Modo Preview</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
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
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Indicators Quick View */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5" />
          Indicadores
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Selic</span>
            <span className="text-chart-selic font-medium">10.75%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IPCA</span>
            <span className="text-chart-ipca font-medium">4.62%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">PIB</span>
            <span className="text-chart-pib font-medium">2.9%</span>
          </div>
        </div>
      </div>

      {/* Back to Home */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar ao Site
          </Link>
        </Button>
      </div>
    </aside>
  );
}
