module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@screens': './src/screens',
          '@components': './src/components',
          '@styles': './src/styles',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@types': './src/types',
          '@store': './src/store',
          '@api': './src/api',
          '@navigation': './src/navigation'
        }
      }
    ]
  ]
};
