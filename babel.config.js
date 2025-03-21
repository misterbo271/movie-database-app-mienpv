module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          "@src": "./src",
          "@screens": "./src/screens",
          "@components": "./src/components",
          "@types": "./src/types",
          "@utils": "./src/utils",
          "@hooks": "./src/hooks",
          "@services": "./src/services",
          "@assets": "./src/assets",
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      },
    ],
  ],
};
