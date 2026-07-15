const { resolve } = require('path');
const CI = !!process.env.CI;

const ROOT_DIR = __dirname;

const ESM_PACKAGES = [
  'uuid',
];

module.exports = {
  testEnvironment: 'node',
  rootDir: ROOT_DIR,
  restoreMocks: true,
  reporters: ['default'],
  modulePathIgnorePatterns: ['dist'],
  collectCoverage: false,
  cacheDirectory: resolve(ROOT_DIR, `${CI ? '' : 'node_modules/'}.cache/jest`),
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.ts?$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    `node_modules/(?!(${ESM_PACKAGES.join('|')})/)`,
  ],
};
