// Configuración de ESLint 10 (formato "flat", sustituye a .eslintrc y .eslintignore).
// Las mismas reglas de base que antes: las recomendadas de ESLint, con las
// variables sin usar como aviso. ESLint 10 ya entiende JSX sin plugins.
// (SETUP-06: eslint-plugin-react aún no admite ESLint 10; ver el plan.)
import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
]
