const path = require("path")
const process = require("process")
const webpack = require("webpack")
const chokidar = require("chokidar")

const util = require("./util")
const HotClient = require("./HotClient")
const HotServer = require("./HotServer")

const CWD = process.cwd()

class HotServers {
  constructor() {
    // Bind our functions to avoid any scope/closure issues.
    this.start = this.start.bind(this);
    this.restart = this.restart.bind(this);
    this._configureHotClient = this._configureHotClient.bind(this);
    this._configureHotServer = this._configureHotServer.bind(this);

    this.clientBundle = null;
    this.clientCompiler = null;
    this.serverBundle = null;
    this.serverCompiler = null;
  }

  start() {
    try {
      const clientConfig = require('./webpack.client.config')({ mode: 'development' });
      this.clientCompiler = webpack(clientConfig);
      const serverConfig = require('./webpack.server.config')({ mode: 'development' });
      this.serverCompiler = webpack(serverConfig);
    } catch (err) {
      util.createNotification({
        title: 'webpack',
        message: '😵  Webpack config invalid, check console for error',
      });
      console.log(err);
      return;
    }

    this._configureHotClient();
    this._configureHotServer();
  }


  dispose() {
    // We want to forcefully close our servers (passing true) which will hard
    // kill any existing connections.  We don't care about them running as we
    // need to restart both the client and server bundles.
    const safeDisposeClient = () =>
      (this.clientBundle ? this.clientBundle.dispose(true) : Promise.resolve());
    const safeDisposeServer = () =>
      (this.serverBundle ? this.serverBundle.dispose(true) : Promise.resolve());

    return safeDisposeClient().then(safeDisposeServer);
  }

  restart() {
    const clearWebpackConfigsCache = () => {
      Object.keys(require.cache).forEach(modulePath => {
        if (~modulePath.indexOf('webpack')) {
          delete require.cache[modulePath];
        }
      });
    };

    this.dispose()
      .then(clearWebpackConfigsCache)
      .then(this.start, err => console.log(err))
      .catch(err => console.log(err));
  }

  _configureHotClient() {
    this.clientCompiler.plugin('done', (stats) => {
      if (stats.hasErrors()) {
        util.createNotification({
          title: 'client',
          message: '😵  Build failed, check console for error',
        });
        console.log(stats.toString());
      } else {
        util.createNotification({
          title: 'client',
          message: '✅  Built',
        });
      }
    });

    this.clientBundle = new HotClient(this.clientCompiler);
  }

  _configureHotServer() {
    const compileHotServer = () => {
      const runCompiler = () => this.serverCompiler.run(() => undefined);
      // Shut down any existing running server if necessary before starting the
      // compile, else just compile.
      if (this.serverBundle) {
        this.serverBundle.dispose().then(runCompiler);
      } else {
        runCompiler();
      }
    };

    this.clientCompiler.plugin('done', (stats) => {
      if (!stats.hasErrors()) {
        compileHotServer();
      }
    });

    this.serverCompiler.plugin('done', (stats) => {
      if (stats.hasErrors()) {
        util.createNotification({
          title: 'server',
          message: '😵  Build failed, check console for error',
        });
        console.log(stats.toString());
        return;
      }

      util.createNotification({
        title: 'server',
        message: '✅  Built',
      });

      // Make sure our newly built server bundles aren't in the module cache.
      Object.keys(require.cache).forEach(modulePath => {
        if (~modulePath.indexOf(this.serverCompiler.options.output.path)) {
          delete require.cache[modulePath];
        }
      });

      this.serverBundle = new HotServer(this.serverCompiler);
    });

    // Now we will configure `chokidar` to watch our server specific source folder.
    // Any changes will cause a rebuild of the server bundle.
    this.watcher = chokidar.watch([path.resolve(__dirname, './src/server')]);
    this.watcher.on('ready', () => {
      this.watcher
        .on('add', compileHotServer)
        .on('addDir', compileHotServer)
        .on('change', compileHotServer)
        .on('unlink', compileHotServer)
        .on('unlinkDir', compileHotServer);
    });
  }
}

module.exports = HotServers
