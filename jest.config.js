module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|expo|@expo|expo-location|@unimodules|unimodules|@react-navigation|@react-native|@firebasegen)'
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
