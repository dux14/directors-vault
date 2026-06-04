/* ============================================
 * Vault Aperture — logo mark
 * Anillo + 8 aspas de iris (= escala F→S)
 * Fuente de verdad vectorial de la identidad
 * ============================================ */

type ApertureLogoProps = {
  size?: number;
  /** "full" = anillo + 8 aspas · "simple" = anillo + 4 aspas (≤32px) · "dot" = anillo + punto (16px) */
  variant?: "full" | "simple" | "dot";
  color?: string;
};

export default function ApertureLogo({
  size = 24,
  variant = "full",
  color = "#d4a843",
}: ApertureLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth={variant === "dot" ? 14 : 7} />
      {variant === "full" && (
        <g stroke={color} strokeWidth="5.5" strokeLinecap="round">
          <line x1="50" y1="14" x2="63" y2="36" />
          <line x1="75.5" y1="24.5" x2="63.5" y2="47" />
          <line x1="86" y1="50" x2="61" y2="55" />
          <line x1="75.5" y1="75.5" x2="53" y2="63.5" />
          <line x1="50" y1="86" x2="37" y2="64" />
          <line x1="24.5" y1="75.5" x2="36.5" y2="53" />
          <line x1="14" y1="50" x2="39" y2="45" />
          <line x1="24.5" y1="24.5" x2="47" y2="36.5" />
        </g>
      )}
      {variant === "simple" && (
        <g stroke={color} strokeWidth="8" strokeLinecap="round">
          <line x1="50" y1="16" x2="61" y2="37" />
          <line x1="84" y1="50" x2="60" y2="55" />
          <line x1="50" y1="84" x2="39" y2="63" />
          <line x1="16" y1="50" x2="40" y2="45" />
        </g>
      )}
      {variant === "dot" && <circle cx="50" cy="50" r="11" fill={color} />}
    </svg>
  );
}
