module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'func-names': 'off',
    'object-shorthand': 'off',
    'consistent-return': 'off',
    'no-unused-vars': 'off',
    'no-self-assign': 'off',
    'global-require': 'off',
    'max-len': 'off',
    'linebreak-style': 'off',
  },
};