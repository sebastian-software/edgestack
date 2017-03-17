# About

**EdgeStack** combines modern React related technologies for effective development of React SPA/PWAs.
It allows applications to use React in a more framework-like approach where you have a single dependency
in your application managing indirect dependencies and build flow in one central place. Powered by
Universal React where we render the initial Markup on the server, too, we sport excellent SEO results.
For **EdgeStack** it's important to bet on excellently developed and maintained technologies. Each piece
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


## Libraries & Components

### React as a view layer

- Lightweight rendering engine with a small API surface to get used to in hours.
- Large ecosystem with lots of enterprises relying on it and hundreds of best-in-class add-on libraries.
- Consequent and rapid development to improve the core functionality.
- Heavily used by its owner on facebook.com.
- Compatible rendering alternatives like Preact or Inferno are available.
- Long term strategic versioning with no regular breakage.

### Redux

- Single source of truth for the whole application state.
- Works excellent in combination with React Universal to share the state from client to the server.
- Time Traveling in developer tools to understand and reproduce application state changes

### Apollo GraphQL (optional)

- Built on redux - works fine together with Redux development tools
- Far smaller and less complex than Relay while keeping most of its more advanced features.

### Webpack

- Hot Module Reloading for excellent developer productivity.
- HardSource Plugin for Webpack for smart loader caching and dramatically increased rebuild performance.



### PostCSS

- A big challenge for large application development is the isolation of styles from each other. We are using relying on CSS modules directly supported by the `css-loader` in Webpack which is actually powered by PostCSS.
- Instead of adding another parser and CSS transpiler to the development chain like Sass or Less we are using PostCSS for development enhancements, too. This includes typical features like imports, variables, mixins, conditionals, math expressions, etc.
- Using just one tool for the whole process is beneficial for build times and developer experience. Using different tools doubles or triples the runtime (especially relevant for Hot Module Reloading) and often times breaks other developer features like source maps.
- PostCSS is regarded as the CSS processing tool chain and a lot of other tools are built on top of it.


### Autoprefixer

- Instead of manually managing writing prefixes or relying on Sass-Mixins we are using a public database driven approach.
- Does far more than just addition of prefixes e.g. fixing flexbox differences, supporting different linear gradient syntaxes, etc.


### LostGrid


### Grid Kiss





### Stylelint

- PostCSS-based linter for all CSS dialects. Supports alternative dialects like SugarSS,
- Its counterpart `stylefmt` support auto formatting stylesheets based on the stylelint rules defined.


### ESLint


### Babel

#### Babili


### Express



### Lint Staged



### Jest
