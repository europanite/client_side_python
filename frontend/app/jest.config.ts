 module.exports = {
   preset: 'jest-expo',
   testEnvironment: 'jsdom',
   setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
     '\\.(png|jpe?g|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
     '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
     'react-native-reanimated': 'react-native-reanimated/mock',
    '^expo($|/.+)': '<rootDir>/__mocks__/expoMock.js',
    '^expo-router($|/.+)': '<rootDir>/__mocks__/expoRouterMock.js',
    '^expo-constants$': '<rootDir>/__mocks__/expoConstantsMock.js',
   },
  setupFiles: ['<rootDir>/jest.setupFiles.js'],
   transformIgnorePatterns: [
     'node_modules/(?!(react-native'
       + '|@react-native'
       + '|react-clone-referenced-element'
       + '|@react-navigation'
       + '|react-navigation'
       + '|expo(nent)?'
       + '|@expo(nent)?/.*'
       + '|expo-modules-core'
       + '|expo-.*'
       + '|@expo/.*'
       + '|@react-native/polyfills'
     + ')/)',
   ],
   testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
 };
