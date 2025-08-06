import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Desabilita erro de Unexpected any
      "@typescript-eslint/no-unused-vars": "off", // Desabilita a regra para variáveis não utilizadas
      "no-unused-vars": "off", // Desabilita a regra para variáveis não utilizadas
      "prefer-const": "off", // Desabilita erro de prefer-const
      "react-hooks/exhaustive-deps": "off", // Desabilita warning de dependências do useEffect
    },
  },
];

export default eslintConfig;

