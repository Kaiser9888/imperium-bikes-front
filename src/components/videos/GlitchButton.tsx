import Link from "next/link";
import type { ReactNode } from "react";

interface GlitchButtonProps {
    text: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
    size?: "sm" | "md";
    className?: string;
}

/** CTA principal da área de vídeos. O texto vai em data-text para o efeito glitch. */
export function GlitchButton({ text, href, onClick, icon, size = "md", className = "" }: GlitchButtonProps) {
    const classes = `glitch-btn ${size === "sm" ? "glitch-btn--sm" : ""} ${className}`;

    if (href) {
        return (
            <Link href={href} data-text={text} className={classes}>
                {icon}
                {text}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} data-text={text} className={classes}>
            {icon}
            {text}
        </button>
    );
}
