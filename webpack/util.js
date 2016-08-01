const notifier = require("node-notifier")
const fs = require("fs");
const filesize = require("filesize");
const gzipSize = require("gzip-size").sync;
const chalk = require("chalk");

function createNotification(options = {})
{
  notifier.notify({
    title: options.title,
    message: options.message,
    open: options.open,
  })

  console.log(`${options.title}: ${options.message}`)
}

function logAssets(assets, buildFolder) {
  console.log('File sizes after gzip:');
  var assets = assets
    .filter(asset => !/\.(map)$/.test(asset.name))
    .map(asset => {
      var fileContents = fs.readFileSync(buildFolder + '/' + asset.name);
      return {
        name: asset.name,
        size: gzipSize(fileContents)
      };
    });
  assets.sort((a, b) => b.name > a.name);
  assets.forEach(asset => {
    console.log('- ' + chalk.cyan(asset.name) + ': ' + chalk.green(filesize(asset.size)));
  });
  console.log();
}

module.exports = {
  createNotification,
  logAssets
}
