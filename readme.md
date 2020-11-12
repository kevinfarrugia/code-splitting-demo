# Code Splitting Demo

This demo aims to answer some frequently asked related to code-splitting & chunking. The demo is built on top of [Performance First React Template](https://github.com/kevinfarrugia/performance-first-react-template) using `React.lazy` and [route-based code-splitting](https://reactjs.org/docs/code-splitting.html#route-based-code-splitting) using [react-router-dom](https://reactrouter.com/web/guides/quick-start).

The code-splitting configuration is found in `scripts/webpack.config.js` and the routing configuration is found in `src/js/components/router/index.jsx`.

The **Page1** component has a dependency on `Glider` which is taken from the [react-glider](https://github.com/hipstersmoothie/react-glider). This file then has a dependency on [glider-js](https://github.com/NickPiscitelli/Glider.js) including its respective CSS file.

**src/js/components/glider/index.jsx**

```
import "glider-js";
import "glider-js/glider.min.css";
```

_In this demo, most files are small (and might not require to be separated into separate chunks) and only used for demonstration purposes._

## Output

If you inspect the network traffic, you are able to see the following chunks:

| File                 | Description                                                                                                                                         | Lazy Loaded |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `runtime.[hash].js`  | The Webpack runtime chunk. Configured using [`runtimeChunk: "single"`](https://webpack.js.org/configuration/optimization/#optimizationruntimechunk) | No          |
| `vendors.[hash].js`  | The main vendors chunk generated from imported third-parties..                                                                                      | No          |
| `critical.[hash].js` | The CSS modules file for critical CSS.                                                                                                              | No          |
| `client.[hash].js`   | The main JavaScript chunk.                                                                                                                          | No          |
| `client.[hash].css`  | The main CSS chunk.                                                                                                                                 | No          |
| `4.[hash].chunk.js`  | The JavaScript for **Page1** and its dependencies (includes `glider-js`).                                                                           | No          |
| `4.[hash].chunk.css` | The CSS for **Page1** and its dependencies (includes `glider-js/glider.min.css`).                                                                   | No          |
| `5.[hash].chunk.js`  | The JavaScript for **Page2**                                                                                                                        | No          |
| `5.[hash].chunk.css` | The CSS for **Page2** (excludes `/home/style.scss`)                                                                                                 | No          |

_Please note that the chunk IDs may change on rebuild._

---

### Will stylesheets be bundled in separate chunks?

If one or more stylesheets are imported in a single module or its dependencies, then a reference to the bundled stylesheet will only be included in that module's chunk. For clarity, a chunk may consist of more than one file (JS & CSS).

In our example, **Page1** imports a stylesheet:

```
import styles from "./style.scss";
```

As it is the only file which references this stylesheet, then it will be chunked. Additionally, **Page1** is the only module which imports the `Glider` component, which imports another two stylesheets. All these will be included in a single chunk, together with the `style.scss` above.

On the contrary, if a stylesheet is imported in more than one module, then a single stylsheet is referenced by both modules, resulting in a single downloaded CSS file.

In our example, **Page2** imports a shared stylesheet:

```
import sharedStyles from "../home/style.scss";
```

This stylesheet is also imported in the `Home` module and therefore not included in the Page2 chunk.

### What about images?

Images are only downloaded when needed and referenced in the DOM. This means that images should have no impact on your bundle sizes.

If you are importing your images using file-loader's [`esModule`](https://webpack.js.org/loaders/file-loader/#esmodule) then you will benefit from module concatenation and tree-shaking on used images.

If you are using [url-loader](https://webpack.js.org/loaders/url-loader/) and your images are being encoded into Base64 or SVG strings, then they will be encoded into each chunk resulting in duplicate code.

### May I use CommonJS imports?

Yes, CommonJS & ES6 module imports work equally well.

In our example, in **Page2** the below two lines result in equivalent chunks:

```
const styles = require("./style.scss");
// import styles from "./style.scss");
```

### Does code-splitting work with named exports?

`React.lazy` requires you to have a default export, however you may use a combination of named and default exports if you wish.

### Will `export * from "./my-module"` be tree-shaken?

No, using `export * from "./my-module"` means that any named export in `./my-module` will be included in the chunk and is strongly discouraged. If you use default exports (my personal preference) then this syntax isn't even permitted.

The example code includes a component **Page3** which uses named exports and exports an unused component **../glider-named-export**. The resultant chunk includes the contents of both **../glider-named-export** and **../glider** even if only one of the components is referenced. There are no linting errors apart from `import/prefer-default-export`, making this difficult to debug & identify.

### When using route-based code-splitting, is it possible to have some routes lazy-loaded while others loaded regularly?

Yes, definitely. In this example, the Home module is loaded regularly while the other pages are loaded lazily.

```
import Home from "../home";

const Page1 = React.lazy(() => import("../page1"));
const Page2 = React.lazy(() => import("../page2"));
```

```
<Suspense fallback={null}>
  <Switch>
    <Route path="/1" exact>
      <Page1 />
    </Route>
    <Route path="/2" exact>
      <Page2 />
    </Route>
    <Route>
      <Home />
    </Route>
  </Switch>
</Suspense>
```

### Why did you disable SSR?

I disabled SSR to simplify the demo as ReactDOMServer does not yet support Suspense. This could be mitigated using dynamic imports or [Loadable Components](https://github.com/gregberge/loadable-components).

### Does this work with critical (inlined) CSS?

The current configuration inlines a single critical CSS file which includes all critical CSS defined across the project. This is done using the following code inside **scripts/webpack.config.js**:

```
criticalStyles: {
  name: "critical",
  test: /critical\.(sa|sc|c)ss$/,
  chunks: "initial",
  enforce: true,
}
```

The output of this chunk is then inlined in **src/templates/index.hbs**:

```
<% if (/critical(\..*)?\.css$/.test(htmlWebpackPlugin.files.css[index])) { %>
  <style>
    <%= compilation.assets[htmlWebpackPlugin.files.css[index].substr(htmlWebpackPlugin.files.publicPath.length)].source() %>
  </style>
<% } %>
```

_This could be possibly be reconfigured to inline a separate CSS file for each route; however I have not tested this myself._

## Contributing

Anyone and everyone is welcome to contribute to this project and leave feedback. Please take a moment to review the [guidelines for contributing](contributing.md).

## License

Copyright © 2020 Spiffing Ltd. This source code is licensed under the MIT license found in the [LICENSE](LICENSE) file.

---

Please feel free to get in touch with me. Kevin Farrugia ([@imkevdev](https://twitter.com/imkevdev))
