import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo className="h-9 mb-4 bg-white rounded-xl shadow-md px-3 py-1" />
            <p className="text-muted-foreground max-w-md">
              Ecossistema de Inteligência Macroeconômica para Decisão Financeira. 
              Transformamos indicadores econômicos em estratégias claras para suas decisões de capital.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#indicadores" className="text-muted-foreground hover:text-foreground transition-colors">
                  Indicadores
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} CAPITALYS. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              A CAPITALYS não realiza contratação de produtos financeiros. 
              Somos uma plataforma de apoio à decisão.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
