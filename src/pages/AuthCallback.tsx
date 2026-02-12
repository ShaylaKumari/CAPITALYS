import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let unsub = { subscription: { unsubscribe: () => {} } };

    // 1) escuta a mudança de auth (quando a sessão entrar)
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/dashboard", { replace: true });
    });
    unsub = data;

    // 2) tenta ler sessão imediatamente (caso já esteja pronta)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/dashboard", { replace: true });
    });

    // 3) fallback: se não logou em X tempo, volta pro auth (opcional)
    const t = window.setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 4000);

    return () => {
      window.clearTimeout(t);
      unsub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
