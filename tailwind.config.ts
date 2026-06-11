// tailwind.config.ts (se não existir, crie na raiz)
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#1E1F22',
                    800: '#3A3D42',
                    700: '#6B7077',
                },
                light: {
                    400: '#C9C7C2',
                    100: '#EFEDE6',
                }
            }
        },
    },
    plugins: [],
};

export default config;