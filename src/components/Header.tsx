import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Target, LayoutDashboard } from "lucide-react";

function getInitials(fullName: string | null | undefined, email: string | undefined): string {
  if (fullName) {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "U";
}

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="flex items-center rounded-xl">
              <Logo className="h-8" />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/objetivos"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Meus Objetivos
                </Link>
                <Link
                  to="/novo-objetivo"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Criar Objetivo
                </Link>
              </>
            ) : (
              <>
                <a
                  href="#indicadores"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Indicadores
                </a>
                <a
                  href="#como-funciona"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Como Funciona
                </a>
                <a
                  href="#sobre"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sobre
                </a>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={profile?.full_name || ""}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(profile?.full_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.full_name && (
                        <p className="font-medium">{profile.full_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/objetivos")}>
                    <Target className="mr-2 h-4 w-4" />
                    Meus Objetivos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="hero" onClick={() => navigate("/auth")}>
                Entrar com Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
