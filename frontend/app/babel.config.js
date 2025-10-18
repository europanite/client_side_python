module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      test: {
        plugins: [
          ['transform-inline-environment-variables', {
            include: ['EXPO_PUBLIC_API_BASE']
          }],
        ],
      },
    },
  };
};
