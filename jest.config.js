module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  "transform": {
    "^.+\\.tsx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$',
    '<rootDir>/src/App.css', // Add this line to exclude App.css
  ],
};
