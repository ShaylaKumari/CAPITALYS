import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    (async () => {
      // 1) troca o "code" da URL por uma sessão (PKCE)
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (!isMounted) return;

      if (error) {
        console.error("exchangeCodeForSession error:", error);
        navigate("/auth", { replace: true });
        return;
      }

      // 2) sessão criada com sucesso → dashboard
      navigate("/dashboard", { replace: true });
    })();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
