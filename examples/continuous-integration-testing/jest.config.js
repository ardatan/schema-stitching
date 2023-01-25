module.exports = {
  testEnvironment: 'node',
  restoreMocks: true,
  reporters: ['default'],
  collectCoverage: false,
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.ts?$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
  },
};
