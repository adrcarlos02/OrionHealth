export default {
  testEnvironment: 'node', // Use Node.js environment
  transform: {
    '^.+\\.js$': 'babel-jest', // Use babel-jest for ES6
  },
  moduleFileExtensions: ['js', 'json', 'node'], // Supported extensions
};