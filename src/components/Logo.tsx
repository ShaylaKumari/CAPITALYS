import logoCapitalys from "@/assets/logo-capitalys.png";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-8" }: LogoProps) {
  return (
    <img
      src={logoCapitalys}
      alt="CAPITALYS"
      className={className}
    />
  );
}
