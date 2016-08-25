import notifier from "node-notifier"
import fs from "fs"
import filesize from "filesize"
import gzipSize from "gzip-size"
import chalk from "chalk"

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
        size: gzipSize.sync(fileContents)
      };
    });
  assets.sort((a, b) => b.name > a.name);
  assets.forEach(asset => {
    console.log('- ' + chalk.cyan(asset.name) + ': ' + chalk.green(filesize(asset.size)));
  });
  console.log();
}

export {
  createNotification,
  logAssets
}
