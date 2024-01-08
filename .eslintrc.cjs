module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    commonjs: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'safari', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react-refresh',
    'react',
  ],
  settings: {
    react: {
      version: 'detect',
    }
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    'max-len': ['error', { 'code': 121 }],
    'no-use-before-define': 0,
    'react/react-in-jsx-scope': 0,
    indent: ['error', 4],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
}
