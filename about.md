# About

**EdgeStack** combines modern React related technologies for effective development of React SPA/PWAs.
It allows applications to use React in a more framework-like approach where you have a single dependency
in your application managing indirect dependencies and build flow in one central place. Powered by
Universal React where we render the initial Markup on the server, too, we sport excellent SEO results.
For **EdgeStack** it's important to bet on high quality and maintained technologies. Each piece
in this development stack has been carefully chosen for the concepts it follows. We prefer good concepts in
future ready technologies over legacy and stable technologies. This is basically why we call it **EdgeStack**:
Offering a peak into the future of modern React development while being relatively stable for day-to-day 
development. **EdgeStack** is a possible solution for keeping this hassle outside of your actual 
application development and therefor scales very well when multiple applications have to be developed.



## Project Content

- Demo Application (`./src/app`, `./src/client`, `./src/server`)
- Exported API for Usage in Applications (`./src/api`)
- Universal React ready Hot Loading infrastructure (`./src/hotdev`)
- Build process based on a custom Webpack Factory (`./src/webpack`)



## Core Features

- Ready for Code Splitting and lazy loading based - typically based on routes.
- Deeply integrated localization and internationalization support.
- Very error tolerant development stack with clean and user friendly feedback. 
- CSS Isolation with CSS modules.



## View Layer

### React ([Project](https://github.com/facebook/react) | [Homepage](https://facebook.github.io/react/))

- Lightweight rendering engine with a small API surface to get used to in hours.
- Large ecosystem with lots of enterprises relying on it and hundreds of best-in-class add-on libraries.
- Consequent and rapid development to improve the core functionality.
- Heavily used by its owner on facebook.com.
- Compatible rendering alternatives like [Preact](https://preactjs.com/) (focus: smaller) or [Inferno](https://infernojs.org/) (focus: faster) are available suggesting that the taken general approach is rock solid. (Hint: We are working on making these available for you to choose from, too).
- Does not force or make assumptions of the rest of the development stack. Scales from easy to complex.



## Data Management

### Redux ([Project](https://github.com/reactjs/redux) | [Homepage](http://redux.js.org/) | [Video Course](https://egghead.io/courses/getting-started-with-redux))

- Single source of truth for the whole application state.
- Works excellent in combination with React Universal to share the preloaded state with the client application.
- Time traveling in developer tools to understand and reproduce different application states.
- Redux evolves the ideas of Flux, but avoids its complexity by taking cues from Elm.

### Apollo GraphQL Client ([Project](https://github.com/apollographql/apollo-client) | [Homepage](http://dev.apollodata.com/))

- Advanced data management: Queries, caching, mutations, optimistic UI, subscriptions, pagination, server-side rendering, prefetching, ...
- Internally built on Redux - works fine together with Redux development tools and custom reducers/actions.
- Far smaller and less complex than Relay while keeping most of its advanced features.
- Universal applicable with clients available for different frameworks and native SDKs.



## Tooling (Production Builds + Development Environment)

### Webpack ([Project](https://github.com/webpack/webpack) | [Homepage](https://webpack.js.org/))

- State of the art module bundler which can deal with different input files (JavaScript, CSS, images, etc.)
- Hot Module Reloading allows for excellent developer productivity. It effectively refreshes rebuilt modules using a WebSocket connection.
- Integrated [HardSource Plugin](https://github.com/mzgoddard/hard-source-webpack-plugin) for smart loader caching and dramatically increased rebuild times.
- Hashing for all output files using SHA256 and [Base62](https://www.npmjs.com/package/base62) for compact file names and permanent caching (ideal for CDNs).



## Styling

### PostCSS ([Project](https://github.com/postcss/postcss) | [Homepage](http://postcss.org/))

- A big challenge for large application development is the isolation of styles so that different components do not influence each other. We are using relying on CSS modules directly supported by the `css-loader` in Webpack which is actually powered by PostCSS.
- Instead of adding another parser and CSS transpiler to the development chain like Sass or Less we are using PostCSS for development enhancements, too. This includes typical features like imports, variables (Sass-like), mixins (Sass-like), conditionals, `calc()` expressions, etc.
- Using just one tool for the whole process is beneficial for build times and developer experience. Using different tools doubles or triples the build times (especially relevant in conjunction with Hot Module Reloading) and often times breaks other developer features like source maps (required for identifying source locations of implementations and errors).
- PostCSS is regarded as the CSS processing tool chain with lots of plugins to extend its functionality. 
- A lot of other tools are built on top of it like linters (stylelint), formatters (stylefmt), etc.

### CSS Modules ([Project](https://github.com/css-modules/css-modules))

- We use CSS modules for sandboxing styles of different components / areas from each other.
- The functionality is built into [CSS Loader by Webpack](https://github.com/webpack-contrib/css-loader#css-modules) and is enabled in EdgeStack.
- See also: [Benefits over other solutions](https://gist.github.com/DavidWells/9e4436608b834f1d3c0346db3631d774#gistcomment-2053946)

### Autoprefixer ([Project](https://github.com/postcss/autoprefixer))

- Instead of manually managing writing prefixes or relying on custom mixins we are using a data driven approach ([Can I Use Database](http://caniuse.com/)).
- Does far more than just addition of prefixes e.g. fixing flexbox differences, supporting different linear gradient syntaxes, etc.

### Lost Grid ([Project](https://github.com/peterramsing/lost))

- Instead of assigning dozens of feature specific classes to each individual DOM node / React component we use more meaningful class names and attach features to them.
- The concept allows solving Responsive Layout in CSS instead of putting it into JSX and this way deep inside the data rendering logic (JS) where it does not belong to.

> CSS frameworks cause problems by unnecessarily constraining our content to fit into a predefined grid. How can a CSS framework know what our content is? It can’t. – Via: [Stop using device breakpoints](https://medium.com/simple-human/stop-using-device-breakpoints-b11a87e2625c)

### Grid Kiss ([Project](https://github.com/sylvainpolletvillard/postcss-grid-kiss))

- Alternative CSS-Grid-based ASCII-art powered Grid system which allows visually designing a Grid layout. 
- Makes designing grids visually and easy to understand. Especially long term and in larger development groups.
- Supports fallback for browsers without native CSS Grid support based on CSS `calc()`



## JavaScript Transpilation

### Babel ([Project](https://github.com/babel/babel) | [Homepage](https://babeljs.io/))

- Transpiling of modern JavaScript code for less modern clients.
- Uses Node v6 environment configuration for our NodeJS backend 




## Code Quality

### Readable Code ([Project](https://github.com/sebastian-software/readable-code))

- Uses the tasks and configurations for 
- Includes Gulp tasks for linting and auto fixing source code automatically.

### Stylelint ([Project](https://github.com/stylelint/stylelint))

- PostCSS-based linter for all CSS dialects. Supports alternative dialects like SugarSS and Sass.

### Stylefmt ([Project](https://github.com/morishitter/stylefmt))

- The counterpart to Stylelint supports auto formatting stylesheets based on the stylelint rules.

### ESLint ([Homepage](eslint.org))

- Effectively a successor of both [JSHint](http://jshint.com/) and [JSCS](http://jscs.info/). Is configured to use the [Babel Parser](https://github.com/babel/babel-eslint) for full ES2017+ support.

#### Quick Linting Overview

- Indent with 2 spaces no tabs
- Double quotes for JS and JSX
- Unix line breaks
- No trailing spaces 
- Tend to more spaces and whitespace in your code
- No dashes in file names (should match `^[a-zA-Z][a-zA-Z0-9.]+$`)
- All files have a `.js` extension, no `.jsx`
- No CommonJS - use only ES2015 modules
- Prefer efficient ES2015 language like template strings, spreading, arrow functions, ...
- Keep an eye on code complexity, nesting levels, file length, ...
- Prefer named parameters (destructing) over long parameter lists
- No usage of `labels`, `with`, `eval`, etc.
- No magic numbers. Use variables to describe intention.

#### Activated and Configured ESLint Plugins

- `filenames`: Validation for file names matching some common sense requirements.
- `flowtype`: Support for checking FlowType syntax to match rules.
- `flowtype-errors`: Helps writing correct FlowType declarations.
- `import`: Checks whether imports map to valid entry points.
- `jsx-a11y`: Accessibility checks for JSX tags e.g. requiring `alt` tags on images.
- `lodash`: Lodash specific checks and hints to prefer common features over custom/builtin.
- `no-use-extend-native`: Prevent extending native objects/classes like `Array` or `String`.
- `node`: Prevents usage of deprecated features and other checks when developing NodeJS based apps.
- `promise`: Checks for correctly working with Promises.
- `react`: React specific checks for requiring specific structures of classes + preferring functional patterns.
- `security`: Checks for security issues in e.g. RegExps.

### Prettier ([Project](https://github.com/prettier/prettier))

- Auto formatting engine for JavaScript which intelligently supports limiting line length and other more advanced features.
- Advanced support for language features from ES2017, JSX, and Flow.

### Lint Staged ([Project](https://github.com/okonet/lint-staged))

- Auto linting for all `.css` and `.js` staged files when these are about to being committed to the repository.



## Server

### Express

### Helmet

### CSP




## Testing (Work in Progress)

### Jest ([Project](https://github.com/facebook/jest) | [Homepage](https://facebook.github.io/jest/))

- Basic component testing with [Jest snapshots](https://facebook.github.io/jest/docs/snapshot-testing.html) is a breeze.
- Runtimes are fast enough to make running the test suite feasible even when used multiple times a day.

### Nightmare ([Project](https://github.com/segmentio/nightmare))

- High-level PhantomJS-based UI testing library.



## Components (Work in Progress)

### React Toolbox v2 ([Project](https://github.com/react-toolbox/react-toolbox) | [Homepage](http://react-toolbox.com/) | [Demo](http://react-toolbox.com/#/components))

- Basic component library using CSS modules for component sandboxing.
- Excellent approach on doing theming of UI components as [part of the version 2 rework](https://github.com/react-toolbox/react-toolbox/blob/dev/ROADMAP.md) using [CSS Themr](https://github.com/javivelasco/react-css-themr)
- More generally speaking all components which are used or are being implemented should follow the guidelines of [Future React UI](https://github.com/nikgraf/future-react-ui)

### Redux Form ([Project](https://github.com/erikras/redux-form) | [Homepage](http://redux-form.com/))

- Effectively the standard for managing form values, implement serialization and state management in Redux applications.
- Implemented as a higher order component for connecting to more primitive form elements.
- Integrated tracking for which fields are being touched/modified together with some flexible validation handling.

### React Virtualized ([Project](https://github.com/bvaughn/react-virtualized) | [Demo](https://bvaughn.github.io/react-virtualized/))

- Highly efficient rendering of crazy large lists and tables where instead of rendering all elements which are available the rendering is limited to the actually visible fraction of the component content.
- All data intensive components should be probably implemented using this library aka data tables, long item lists, auto suggest boxes, country selectors, etc.

### React Sortable HOC ([Project](https://github.com/clauderic/react-sortable-hoc) | [Demo](http://clauderic.github.io/react-sortable-hoc/#/basic-configuration/basic-usage))

- "A set of higher-order components to turn any list into an animated, touch-friendly, sortable list."
- Works together with React Virtualized.
- Super smooth animation.
- Touch ready.

### Sizeme ([Project](https://github.com/ctrlplusb/react-sizeme) | [Demo](https://react-sizeme.now.sh/))

- "Make your React Components aware of their width, height and position."
- Effectively offering [element queries](https://www.smashingmagazine.com/2016/07/how-i-ended-up-with-element-queries-and-how-you-can-use-them-today/) for styling or even better: alternative rendering paths.
- There is a [more high-level wrapper](https://github.com/ctrlplusb/react-component-queries) available for a more query-like approach.

### Overdrive ([Project](https://github.com/berzniz/react-overdrive) | [Homepage](https://react-overdrive.now.sh/))

- Magic-Move style transitions for React components.

### React Motion ([Project](https://github.com/chenglou/react-motion))

- Spring style animations for React components.
