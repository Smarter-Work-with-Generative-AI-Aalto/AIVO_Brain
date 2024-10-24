module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
      },
    },
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  };