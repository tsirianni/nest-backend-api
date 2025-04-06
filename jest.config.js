/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/common/testing/mocks/prisma/prisma-service.ts'],
  collectCoverageFrom: ['**/*.service.ts', '**/*.controller.ts', '**/*.interceptor.ts'],
  coveragePathIgnorePatterns: ['/src/init/', 'src/common/httpClient/', 'src/common/database'],
};
