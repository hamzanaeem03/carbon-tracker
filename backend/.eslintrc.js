module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'func-names': 'off',
    'object-shorthand': 'off',
    'consistent-return': 'warn'
  }
};