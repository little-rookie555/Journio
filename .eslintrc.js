module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended', // 如果你用TS
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: [
    'react',
    '@typescript-eslint' // 如果用到
  ],
  rules: {
    'react/react-in-jsx-scope': 'off' // 如果是 React 17+
  },
  settings: {
    react: { version: 'detect' }
  }
}
