module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        'indent': ['error', 4],
        'linebreak-style': 'off', // Disable linebreak-style for cross-platform compatibility
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'no-console': 'off',
        'no-undef': 'error',
        'prefer-const': 'error',
        'no-var': 'error'
    },
    globals: {
        'AlertTranslator': 'readonly'
    }
};
