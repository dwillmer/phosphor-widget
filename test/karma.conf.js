module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],
    reporters: ['mocha'],
    files: ['build/bundle.js'],
    port: 9876,
    colors: true,
    singleRun: true,
    logLevel: config.LOG_INFO
  });
};
