process.env.NODE_APP_PATH = __dirname
module.exports = {
  // diabolico pq evita mostrar algunos logs cuando los analizo (en dev)
  verbose: true,
  silent: true,
  forceExit: true,
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '__tests__',
    'src/infrastructure/lib/env',
    'src/bin'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.[t|j]sx?$': ['babel-jest', { rootMode: 'upward' }]
  }
}
