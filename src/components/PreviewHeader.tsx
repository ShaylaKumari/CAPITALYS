import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Target, LayoutDashboard, LogOut, Eye } from "lucide-react";
import { mockProfile } from "@/lib/mockData";

export function PreviewHeader() {
  const getInitials = () => {
    if (mockProfile.full_name) {
      return mockProfile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "U";
  };

  return (
    <header className="fixed top-0 left-64 right-0 z-30 h-16 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Preview indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <Eye className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium text-accent">UI Preview</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Visualização sem autenticação
          </span>
        </div>

        {/* User Menu (Mock) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{mockProfile.full_name}</p>
                <p className="text-sm text-muted-foreground">{mockProfile.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/preview/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/preview/objetivos">
                <Target className="mr-2 h-4 w-4" />
                Meus Objetivos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/preview/perfil">
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/">
                <LogOut className="mr-2 h-4 w-4" />
                Sair do Preview
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
