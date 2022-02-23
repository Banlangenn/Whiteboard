module.exports = {
    preset: 'ts-jest',
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'lcov', 'text', 'json'],
    setupFiles: [ 'jest-canvas-mock' ],
    collectCoverageFrom: [
        'packages/src/**/*.ts',
        '!packages/dist/**'
    ],
    watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    rootDir: __dirname,
    testMatch: ['<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)']
//     testPathIgnorePatterns: process.env.SKIP_E2E
//         ? // ignore example tests on netlify builds since they don't contribute
//     // to coverage and can cause netlify builds to fail
//         ['/node_modules/', '/examples/__tests__']
//         : ['/node_modules/']
}
