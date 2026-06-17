interface PIJLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
}

export function PIJLogo({ variant = "full", size = "md", theme = "light" }: PIJLogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-base" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
  };

  const s = sizes[size];
  const textColor = theme === "dark" ? "#FFFFFF" : "#1E2530";

  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Coin base */}
        <circle cx="20" cy="20" r="19" fill="#4CAF68" />
        <circle cx="20" cy="20" r="15" fill="#1F9D55" />
        {/* Purple ribbon accent */}
        <path d="M10 20 Q20 8 30 20 Q20 32 10 20Z" fill="#6E3A9A" opacity="0.85" />
        {/* PIJ letters */}
        <text x="20" y="25" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="700" fill="#FFFFFF" letterSpacing="-0.5">PIJ</text>
      </svg>
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
