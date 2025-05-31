const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure the specific babel transformer is used.
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// It's good practice to ensure assetExts from default config are respected and extended if necessary.
// For now, let's trust getDefaultConfig and only override the transformer.
// config.resolver.assetExts = [...config.resolver.assetExts, 'png']; // Example if needed

module.exports = config; 