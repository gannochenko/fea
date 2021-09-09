module.exports = {
    verbose: true,
    rootDir: '../src',
    setupFiles: ['<rootDir>/../jest/setup.ts'],
    setupFilesAfterEnv: [

        '<rootDir>/../jest/extend.js',
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '\\.test\\.tsx?$',
};
