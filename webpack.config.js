module.exports = (env) => {
  if (env.development) return require('./webpack.dev.config.js');
  if (env.production) return require('./webpack.production.config.js');
};
