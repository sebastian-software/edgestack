# Components

Through the experience of different app developments in React we made some experience with different
component and UI solutions. Following is a list of possible tools for you to add to EdgeStack.


## CSS Core

### Normalize.css

### Sanitize.css

### Normalize OpenType




## Core

### ImmutableJS

- Immutable high capable data structure. 
- Good candidate for usage with Redux but also for internal component state management.

### Lodash (Utility Methods)

- Utility belt for stand

### Recompose

- 

### Reselect

- 




## UI Testing

### Jest ([Project](https://github.com/facebook/jest) | [Homepage](https://facebook.github.io/jest/))

- Basic component testing with [Jest snapshots](https://facebook.github.io/jest/docs/snapshot-testing.html) is a breeze.
- Runtimes are fast enough to make running the test suite feasible even when used multiple times a day.

### Nightmare ([Project](https://github.com/segmentio/nightmare) | [Introduction](https://segment.com/blog/ui-testing-with-nightmare/))

- High-level Electron-based (think of modern PhantomJS) UI testing library.





## Core UI

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

### React Sizeme ([Project](https://github.com/ctrlplusb/react-sizeme) | [Demo](https://react-sizeme.now.sh/))

- "Make your React Components aware of their width, height and position."
- Effectively offering [element queries](https://www.smashingmagazine.com/2016/07/how-i-ended-up-with-element-queries-and-how-you-can-use-them-today/) for styling or even better: alternative rendering paths.
- There is a [more high-level wrapper](https://github.com/ctrlplusb/react-component-queries) available for a more query-like approach.

### React Overdrive ([Project](https://github.com/berzniz/react-overdrive) | [Homepage](https://react-overdrive.now.sh/))

- Magic-Move style transitions for React components.

### React Motion ([Project](https://github.com/chenglou/react-motion))

- Spring style animations for React components.

### React DND ([Project](https://github.com/react-dnd/react-dnd) | [Homepage](http://react-dnd.github.io/react-dnd/) | [Demo](http://react-dnd.github.io/react-dnd/examples-dustbin-single-target.html))

- A set of React higher-order components to help you build complex drag and drop interfaces while keeping your components decoupled.

### React Overlays ([Project](https://github.com/react-bootstrap/react-overlays))

- Utilities for creating robust overlay components e.g. for modals, dialogs, etc.

### React HammerJS ([Project](https://github.com/JedWatson/react-hammerjs))

- Library for support more complex types of touch events like pinch/zoom based on [HammerJS](https://github.com/hammerjs/hammer.js).

### React Tapable ([Project](https://github.com/JedWatson/react-tappable))

- Tap Events as common alternative for click events / touch events.

### React Waypoint ([Project](https://github.com/brigade/react-waypoint))

- Scroll detection and interaction during scroll (fade in/out components, etc.)
- Can be used to build features like lazy loading content, infinite scroll, scrollspies, or docking elements to the viewport on scroll.

### React Focustrap ([Project](https://github.com/davidtheclark/focus-trap-react) | [Demo](http://davidtheclark.github.io/focus-trap/demo/))

- Locking focus and tab sequence to a specific root component - useful for keyboard support.
- Wrapper for standalone [FocusTrap](https://github.com/davidtheclark/focus-trap) library.

### React Displace ([Project](https://github.com/davidtheclark/react-displace))

- Move components out of the render tree structure into e.g. document body for easier positioning.

### NoScroll ([Project](https://github.com/davidtheclark/no-scroll))

- Helper library for interactively preventing the scrolling of the document root.

### React Draggable ([Project](https://github.com/mzabriskie/react-draggable) | [Demo](http://mzabriskie.github.io/react-draggable/example/))

- Component for making elements draggable.

### React Resizable ([Project](https://github.com/STRML/react-resizable))

- Simple component that is resizable with a handle.

### Grid Layout ([Project](https://github.com/STRML/react-grid-layout) | [Demo](https://strml.github.io/react-grid-layout/examples/0-showcase.html))

- Think more of a customizable portal interface engine than a basic (CSS) grid layout implementation.
- Supports responsive, drag&drop customization, serialization (save+restore), ...

### React Move ([Project](https://github.com/tannerlinsley/react-move) | [Demo](https://react-move.js.org/))

- Beautifully and deterministically animate anything in react.


## UI Component Frameworks

### React Toolbox v2 ([Project](https://github.com/react-toolbox/react-toolbox) | [Homepage](http://react-toolbox.com/) | [Demo](http://react-toolbox.com/#/components))

- Basic component library using CSS modules for component sandboxing.
- Excellent approach on doing theming of UI components as [part of the version 2 rework](https://github.com/react-toolbox/react-toolbox/blob/dev/ROADMAP.md) using [CSS Themr](https://github.com/javivelasco/react-css-themr)
- CONTENT?

### Alternative UI framework: Belle

- https://github.com/nikgraf/belle
- CONTENT?


## Single UI Components

### React Autosuggest ([Project](https://github.com/moroshko/react-autosuggest) | [Homepage](http://react-autosuggest.js.org/))

- Compatible with CSS modules.
- WAI ARIA compatible (Accessibility)
- Unfortunately not based on React Virtualized for item rendering.

### React Select ([Project](https://github.com/JedWatson/react-select) | [Demo](http://jedwatson.github.io/react-select/))

- A Select control built with and for React. Supports multiple values, auto complete, lazy loading, etc.
- Does offer [windowing select box](https://github.com/bvaughn/react-virtualized-select/) rendering using React Virtualized.
- It comes with a default styling using "normal" CSS, but as it offers [customizable classnames](https://github.com/JedWatson/react-select#custom-classnames) it should work well in a CSS modules environment.

### DraftJS ([Project](https://github.com/facebook/draft-js) | [Homepage](https://draftjs.org/))

- A JavaScript rich text editor framework, built for React and backed by an immutable model.

### ARIA Menu ([Project](https://github.com/davidtheclark/react-aria-menubutton) | [Demo](http://davidtheclark.github.io/react-aria-menubutton/demo/))

- Accessible menus by providing keyboard interactions and ARIA attributes aligned with the WAI-ARIA Menu Button Design Pattern.

### ARIA Tabpanel ([Project](https://github.com/davidtheclark/react-aria-tabpanel))

- Accessible tabs, by providing keyboard interactions and ARIA attributes described in the WAI-ARIA Tab Panel Design Pattern.

### ARIA Modal ([Project](https://github.com/davidtheclark/react-aria-modal))

- Accessible React modal built according WAI-ARIA Authoring Practices

### DropZone ([Project](https://github.com/okonet/react-dropzone))

- Uploading files using Drag&Drop.

### Infinite Calendar ([Project](https://github.com/clauderic/react-infinite-calendar) | [Demo](http://clauderic.github.io/react-infinite-calendar/#/basic-settings/basic-configuration))

- Endless scrollable calendar or better named "date picker" widget with single or multi/range selection. Mobile friendly. Touch ready.
- Unfortunately just a root CSS Classname configurable without any support for CSS modules.

### React Dates ([Project](https://github.com/airbnb/react-dates) | [Demo](http://airbnb.io/react-dates/))

- Different date picker components (single, range). 
- Created and regularly maintained by Airbnb
- Uses moment.js which is kind of unfortunate as it typically introduces some good amount of overhead.
- Customization is either being based on using Sass variables or override existing CSS - both is limited in scope/flexibility.

### React Leaflet ([Project](https://github.com/PaulLeCam/react-leaflet))

- Embedding of [leaflet](http://leafletjs.com/) based maps for React.
- Well maintained component with regular updates.
- Typically being combined with tiles from [OpenStreetMap](http://openstreetmap.org).

### React Player ([Project](https://github.com/CookPete/react-player))

- Pretty universal video/audio player for React which supports YouTube, Vimeo, Soundcloud and more.

### React Vis ([Project](https://github.com/uber/react-vis) | [Demo](http://uber.github.io/react-vis/))

- Visualization/Chart Engine based on D3 and made by Uber.

### Victory ([Project](https://github.com/FormidableLabs/victory) | [Homepage](http://formidable.com/open-source/victory/))

- Another chart renderer developed by FormidableLabs and used by e.g. Airbnb.

### React Data Grid ([Project](https://github.com/adazzle/react-data-grid))

- Excel like editable data grid implementation with virtual scrolling. 

### Recharts ([Project](https://github.com/recharts/recharts) | [Homepage](http://recharts.org/))

- A composable charting library built on React components and D3.

### React Trend ([Project](https://github.com/unsplash/react-trend))

- Basic line charting component
- Small and no dependencies. Based on basic SVG rendering.

### React Text Mask ([Project](https://github.com/text-mask/text-mask/tree/master/react))

- Wrapper for text mask rendering for a React component.
- Very flexible approach and fully compatible with a basic `<input/>` element.

### React Slick ([Project](https://github.com/akiran/react-slick))

- Slider/Carousel component

### React HTML5 Video ([Project](https://github.com/mderrick/react-html5video))

- A customizeable HoC (Higher Order Component) for HTML5 Video that allows custom and configurable controls with i18n and a11y.

### Slider ([Project](https://github.com/react-component/slider))

- Slider UI component for React

### React Textarea Autosize ([Project](https://github.com/andreypopp/react-textarea-autosize))

- Drop-in replacement for the textarea component which automatically resizes textarea as content changes.

### React Image Crop ([Project](https://github.com/DominicTobias/react-image-crop))

- A responsive image cropping tool for React
