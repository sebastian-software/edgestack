# About

**EdgeStack** combines modern React related technologies for effective development of React SPA/PWAs.
It allows applications to use React in a more framework-like approach where you have a single dependency
in your application managing indirect dependencies and build flow in one central place. Powered by
Universal React where we render the initial Markup on the server, too, we sport excellent SEO results.
For **EdgeStack** it's important to bet on high quality and maintained technologies. Each piece
in this development stack has been carefully chosen for the concepts it follows. We prefer good concepts in
future ready technologies over legacy and stable technologies. This is basically why we call it **EdgeStack**:
Offering a peak into the future of modern React development while being relatively stable for day-to-day 
development. **EdgeStack** is a possible solution for keeping this hassle outside of the actual 
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


---

## View Layer

### [React](https://facebook.github.io/react/) (View Layer)

- Lightweight rendering engine with a small API surface to get used to in hours.
- Large ecosystem with lots of enterprises relying on it and hundreds of best-in-class add-on libraries.
- Consequent and rapid development to improve the core functionality.
- Heavily used by its owner on facebook.com.
- Compatible rendering alternatives like [Preact](https://preactjs.com/) (focus: smaller) or [Inferno](https://infernojs.org/) (focus: faster) are available suggesting that the taken general approach is rock solid. (Hint: We are working on making these available for you to choose from, too).
- Long term strategic versioning with no regular breakage like in the Angular ecosystem.
- Does not force or make assumptions of the rest of the development stack. Scales from easy to complex.

---

## Data Management

### [Redux](http://redux.js.org/)

- Single source of truth for the whole application state.
- Works excellent in combination with React Universal to share the state from client to the server.
- Time Traveling in developer tools to understand and reproduce application state changes

### Apollo GraphQL Client

- Built on redux - works fine together with Redux development tools
- Far smaller and less complex than Relay while keeping most of its more advanced features.
- GraphQL is very interesting for 



---

## Tooling (Production Builds + Development Environment)

### Webpack

- Hot Module Reloading for excellent developer productivity. It effectively refreshes rebuild modules via a WebSocket connection to the client.
- We integrated the HardSource Plugin for smart loader caching and dramatically increased rebuild performance.
- Everything is regarded as an valid input module. So instead of writing manual tasks which deal with non-JS assets we let Webpack solve all of these requirements and apply its magic.




---

## CSS Transpilation

### PostCSS

- A big challenge for large application development is the isolation of styles from each other. We are using relying on CSS modules directly supported by the `css-loader` in Webpack which is actually powered by PostCSS.
- Instead of adding another parser and CSS transpiler to the development chain like Sass or Less we are using PostCSS for development enhancements, too. This includes typical features like imports, variables, mixins, conditionals, math expressions, etc.
- Using just one tool for the whole process is beneficial for build times and developer experience. Using different tools doubles or triples the runtime (especially relevant for Hot Module Reloading) and often times breaks other developer features like source maps.
- PostCSS is regarded as the CSS processing tool chain with lots of plugins to extend its functionality. 
- A lot of other tools are built on top of it.


### [Autoprefixer](https://github.com/postcss/autoprefixer)

- Instead of manually managing writing prefixes or relying on Sass-Mixins we are using a data driven approach (CanIUse Database).
- Does far more than just addition of prefixes e.g. fixing flexbox differences, supporting different linear gradient syntaxes, etc.

### [Lost Grid](https://github.com/peterramsing/lost)

- Instead of assigning dozens of feature specific classes to each individual DOM node we use more meaningful class names and attach features to them.
- The concept allows solving Responsive Layout in CSS instead of putting it into JSX and this way deep inside the data rendering logic (JS) where it does not belong to.
- Uses Flexbox natively which is far cleaner and more powerful than old style float driven layouts.


### [Grid Kiss](https://github.com/sylvainpolletvillard/postcss-grid-kiss)

- Alternative CSS-Grid-based ascii-art powered Grid system which allows visually designing a Grid layout. 





---

## JavaScript Transpilation

### Babel

- Transpiling of modern JavaScript code for less modern clients.




---

## Code Quality

### Stylelint

- PostCSS-based linter for all CSS dialects. Supports alternative dialects like SugarSS,
- Its counterpart `stylefmt` support auto formatting stylesheets based on the stylelint rules defined.


### ESLint

- Effectively a successor of both JSHint and JSCS. Can use the Babel Parser for full ES2017 support.
- Linting utility for JavaScript and JSX. We are using [readable-code](https://github.com/sebastian-software/readable-code) for sensible configuration with support for additional features such as React, Accessibility, filename validation, etc.


### Lint Staged

- TODO


---

## Server

### Express

- TODO




---

## Testing

### Jest

- TODO

### Nightmare

- TODO





---

## Components

### Redux-Form

- TODO

### React Virtualized

- TODO

### Sizeme

- TODO
