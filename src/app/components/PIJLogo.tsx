import pijLogoImg from "../../../images/pij-logo-removebg-preview.png";

interface PIJLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
}

export function PIJLogo({ variant = "full", size = "md", theme = "light" }: PIJLogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-base" },
    md: { icon: 42, text: "text-xl" },
    lg: { icon: 56, text: "text-2xl" },
  };

  const s = sizes[size];
  const textColor = "var(--foreground)";

  return (
    <div className="flex items-center gap-2.5 select-none">
      <img
        src={pijLogoImg}
        alt="PIJ Logo"
        width={s.icon}
        height={s.icon}
        style={{ objectFit: "contain" }}
      />
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span
            className={`${s.text} tracking-tight`}
            style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, color: textColor }}
          >
            PIJ
          </span>
          <span
            className="text-xs tracking-wide uppercase"
            style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 400, color: "#4CAF68", letterSpacing: "0.08em" }}
          >
            Investir pour l'avenir
          </span>
        </div>
      )}
    </div>
  );
}
