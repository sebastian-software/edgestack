# Edge Stack<br/>[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status Unix][travis-img]][travis] [![Build Status Windows][appveyor-img]][appveyor] [![Dependencies][deps-img]][deps]

[sponsor-img]: https://img.shields.io/badge/Sponsored%20by-Sebastian%20Software-692446.svg
[sponsor]: https://www.sebastian-software.de
[deps]: https://david-dm.org/sebastian-software/edgestack
[deps-img]: https://david-dm.org/sebastian-software/edgestack.svg
[npm]: https://www.npmjs.com/package/edgestack
[npm-downloads-img]: https://img.shields.io/npm/dm/edgestack.svg
[npm-version-img]: https://img.shields.io/npm/v/edgestack.svg
[travis-img]: https://img.shields.io/travis/sebastian-software/edgestack/master.svg?branch=master&label=unix%20build
[appveyor-img]: https://img.shields.io/appveyor/ci/swernerx/edgestack/master.svg?label=windows%20build
[travis]: https://travis-ci.org/sebastian-software/edgestack
[appveyor]: https://ci.appveyor.com/project/swernerx/edgestack/branch/master


A Universal React Stack with deeply integrated localization Support, semi-automatic route-based code splitting, Hot Module Reloading (HMR), Redux, Apollo GraphQL and more...


## TOC

 - [About](https://github.com/sebastian-software/edgestack#about)
 - [Features](https://github.com/sebastian-software/edgestack#features)
 - [Overview](https://github.com/sebastian-software/edgestack#overview)
 - [Project Structure](https://github.com/sebastian-software/edgestack#project-structure)
 - [NPM Commands](https://github.com/sebastian-software/edgestack#npm-script-commands)
 - [References](https://github.com/sebastian-software/edgestack#references)


## Key Benefits

- No Boilerplate. Just another dependency to include. Easy future updates & maintenance.
- Route based Code Splitting with Hot Module Reloading (HMR).
- Ready for Localization using React-Intl pre-configured + polyfilled.


## Features

- Universal / Isomorphic application development.
- Extreme live development - hot reloading of client/server source with high level of error tolerance.
- Express server with a basic security configuration using *hpp* and *helmet*.
- *ReactJS* as the view layer.
- React Router v4 as the router.
- *React Helmet* allowing control of the page title/meta/styles/scripts from within your components. Direct control for your SEO needs.
- CSS Support with CSS modules and additional flexible full PostCSS chain for advanced transformations e.g. autoprefixer
- Fully integrated asset support for referencing files in CSS and JavaScript.
- Full ES2015 support, using *Babel* to transpile where needed.
- Bundling of both client and server using *Webpack* v2. See also: [The Cost of Small Modules](https://nolanlawson.com/2016/08/15/the-cost-of-small-modules/)
- Client bundle is automatically split by routes.
- Long term caching of the client bundle works out of the box.
- Support for development and optimized production configuration.
- Easy environment configuration via `dotenv` files.
- *Markdown* rendering for Components integrated.
- Super modular Lodash with Webpack tooling to enable automatic tree shaking
- Fetch API Polyfill integrated
- PostCSS *Lost Grid* integrated
- Redux and Thunk middleware
- Apollo Client (GraphQL)
- Data Loading on Server Side using `fetchData` static methods where available
- HardSource pre-configured for unseen rebuild performance.

## Work in progress

- *Jest* for unit testing
- Flow Typechecking


## Overview

This solution uses Webpack 2 to produce bundles for both the client and the server code.

The reasoning for using Webpack to bundle both the client and the server is to bring greater interop and extensibility to the table. This will for instance allowing server bundles to handle React components that introduce things like CSS or Images (as and when you add the respective loaders).

Given that we are bundling our server code I have included the `source-map-support` module to ensure that we get nice stack traces when executing our code via node.

All the source code is written in ES2015, and I have explicitly kept it to the true specification (bar JSX syntax). As we are following this approach it is unnecessary for us to transpile our source code for the server into ES5, as `node` v6 has native support for almost all of the ES2015 syntax. Our client (browser) bundle is however transpiled to ES5 code for maximum browser/device support.

The application configuration is supported by the `dotenv` module and it requires you to create a `.env` file in the project root (you can use the `.env.example` as a base). The `.env` file has been explicitly ignored from git as it will typically contain environment sensitive/specific information. In the usual case your continuous deployment tool of choice should configure the specific `.env` file that is needed for a target environment.



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
|- .env.example // An example from which to create your own .env file.
|- rollup.config.js // Configuration file for bundling scripts into executable
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


## [License](license)

## Copyright

<img src="https://raw.githubusercontent.com/sebastian-software/s15e-javascript/master/assets/sebastiansoftware.png" alt="Sebastian Software GmbH Logo" width="250" height="200"/>

Copyright 2016-2017<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
