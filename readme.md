# Advanced Boilerplate<br/>[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status Unix][travis-img]][travis] [![Build Status Windows][appveyor-img]][appveyor] [![Dependencies][deps-img]][deps]

[sponsor-img]: https://img.shields.io/badge/Sponsored%20by-Sebastian%20Software-692446.svg
[sponsor]: https://www.sebastian-software.de
[deps]: https://david-dm.org/sebastian-software/advanced-boilerplate
[deps-img]: https://david-dm.org/sebastian-software/advanced-boilerplate.svg
[npm]: https://www.npmjs.com/package/advanced-boilerplate
[npm-downloads-img]: https://img.shields.io/npm/dm/advanced-boilerplate.svg
[npm-version-img]: https://img.shields.io/npm/v/advanced-boilerplate.svg
[travis-img]: https://img.shields.io/travis/sebastian-software/advanced-boilerplate/master.svg?branch=master&label=unix%20build
[appveyor-img]: https://img.shields.io/appveyor/ci/swernerx/advanced-boilerplate/master.svg?label=windows%20build
[travis]: https://travis-ci.org/sebastian-software/advanced-boilerplate
[appveyor]: https://ci.appveyor.com/project/swernerx/advanced-boilerplate/branch/master


A NodeJS V6 Universal React Boilerplate with an Amazing Developer Experience.


## TOC

 - [About](https://github.com/sebastian-software/advanced-boilerplate#about)
 - [Features](https://github.com/sebastian-software/advanced-boilerplate#features)
 - [Overview](https://github.com/sebastian-software/advanced-boilerplate#overview)
 - [Project Structure](https://github.com/sebastian-software/advanced-boilerplate#project-structure)
 - [NPM Commands](https://github.com/sebastian-software/advanced-boilerplate#npm-script-commands)
 - [References](https://github.com/sebastian-software/advanced-boilerplate#references)


## About

This boilerplate contains an absolutely minimal set of dependencies in order to get you up and running with a universal react project as quickly as possible. It provides you with a great development experience that includes hot reloading of everything.



## Features

  - Server side rendering.
  - Extreme live development - hot reloading of client/server source as well as your _webpack configuration_, with high level of error tolerance.
  - Express server with a basic security configuration.
  - ReactJS as the view layer.
  - React Router as the router.
  - CSS Support with CSS modules and additional flexible full PostCSS chain for advanced transformations e.g. autoprefixer
  - Full ES2015 support, using `babel` to transpile where needed.
  - Bundling of both client and server using `webpack` v2.
  - Client bundle is automatically split by routes and uses tree-shaking (newly supported by `webpack` v2).
  - A development and optimized production configuration.
  - Easy environment configuration via `dotenv` files.
  - ESLint v3 integrated with sensible default configuration.
  - Markdown rendering for Components.


## Overview

Data persistence, test frameworks, and all the other bells and whistles have been explicitly excluded from this boilerplate. It's up to you to decide what technologies you would like to add to your own implementation based upon your own needs, this boilerplate simply serves as a clean base upon which to do so.

This boilerplate uses Webpack 2 to produce bundles for both the client and the
server code.

The reasoning for using Webpack to bundle both the client and the server is to bring greater interop and extensibility to the table. This will for instance allowing server bundles to handle React components that introduce things like CSS or Images (as and when you add the respective loaders).

Given that we are bundling our server code I have included the `source-map-support` module to ensure that we get nice stack traces when executing our code via node.

All the source code is written in ES2015, and I have explicitly kept it to the true specification (bar JSX syntax). As we are following this approach it is unnecessary for us to transpile our source code for the server into ES5, as `node` v6 has native support for almost all of the ES2015 syntax. Our client (browser) bundle is however transpiled to ES5 code for maximum browser/device support.

The application configuration is supported by the `dotenv` module and it requires you to create a `.env` file in the project root (you can use the `.env_example` as a base). The `.env` file has been explicitly ignored from git as it will typically contain environment sensitive/specific information. In the usual case your continuous deployment tool of choice should configure the specific `.env` file that is needed for a target environment.



## Project Structure

```
/
|- lib // The target output dir for our library export
|  |- index.es.js // ES2015 module export
|  |- index.js // CommonJS export
|
|- build // The target output dir for our build commands.
|  |- client // The built client module.
|  |- server // The built server module
|
|- src  // All the source code
|  |- common // Common utilities
|  |- config // Central configuration files
|  |- server // The server specific source
|  |- client // The client specific source
|  |- demo // Demo application
|  |- webpack // Build infrastructure
|  |- scripts // Available scripts when installed via npm
|
|- .babelrc // Dummy babel configuration
|- .env_example // An example from which to create your own .env file.
|- rollup.script.cfg // Configuration file for bundling scripts into executable
```



## NPM Commands

### `npm run start`

Starts a development server for both the client and server bundles. We use `react-hot-loader` v3 to power the hot reloading of the client bundle, whilst a filesystem watch is implemented to reload the server bundle when any changes have occurred.

### `npm run prod`

Builds the client and server bundles, with the output being production optimized.

### `npm run prod:start`

Executes the server. It expects you to have already built the bundles either via the `npm run build` command or manually.

### `npm run clean`

Deletes any build output that would have originated from the other commands.



## References

  - __Webpack 2__ - https://gist.github.com/sokra/27b24881210b56bbaff7
  - __React Hot Loader v3__ - https://github.com/gaearon/react-hot-boilerplate/pull/61
  - __dotenv__ - https://github.com/bkeepers/dotenv



## Copyright

<img src="https://raw.githubusercontent.com/sebastian-software/s15e-javascript/master/assets/sebastiansoftware.png" alt="Sebastian Software GmbH Logo" width="250" height="200"/>

Copyright 2016<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
