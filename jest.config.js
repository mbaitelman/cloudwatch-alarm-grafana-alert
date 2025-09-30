module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: [
        'alertTranslator.js',
        '!tests/**',
        '!node_modules/**',
        '!jest.config.js',
        '!.eslintrc.js',
        '!app.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov',
        'html',
        'json'
    ],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    verbose: true,
    testTimeout: 10000
};
