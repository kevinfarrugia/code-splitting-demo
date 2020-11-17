# Code splitting is hard

This demo aims to answer some frequently asked questions related to code-splitting & chunking. The demo is built on top of [Performance First React Template](https://github.com/kevinfarrugia/performance-first-react-template), which uses Webpack and ReactJS. For the scope of this demo I will be using `React.lazy` [route-based code-splitting](https://reactjs.org/docs/code-splitting.html#route-based-code-splitting) and [react-router-dom](https://reactrouter.com/web/guides/quick-start).

The code-splitting configuration is found in [**scripts/webpack.config.js**](https://github.com/kevinfarrugia/code-splitting-demo/blob/master/scripts/webpack.config.js) and the routing configuration is found in [**src/js/components/router/index.jsx**](https://github.com/kevinfarrugia/code-splitting-demo/blob/master/src/js/components/router/index.jsx).

_Note: In this demo project, most files are small and you probably wouldn't want to separate them into chunks in a production environment. It should only serve to test or illustrate the principle._

## Output

If you inspect the network traffic, you are able to see the following chunks (note that the chunk IDs may change on rebuild):

| File                 | Description                                                                                                                                         | Lazy Loaded |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `runtime.[hash].js`  | The Webpack runtime chunk. Configured using [`runtimeChunk: "single"`](https://webpack.js.org/configuration/optimization/#optimizationruntimechunk) | No          |
| `vendors.[hash].js`  | The main vendors chunk generated from imported third-parties.                                                                                       | No          |
| `critical.[hash].js` | The CSS modules file containing the class names for the critical CSS.                                                                               | No          |
| `client.[hash].js`   | The main JavaScript chunk.                                                                                                                          | No          |
| `client.[hash].css`  | The main CSS chunk.                                                                                                                                 | No          |
| `0.[hash].chunk.js`  | The JavaScript for **Glider** and its dependencies (includes third-party `glider-js`).                                                              | Yes         |
| `5.[hash].chunk.js`  | The JavaScript for **Page1** and its dependencies (includes third-party `glider-js`).                                                               | Yes         |
| `5.[hash].chunk.css` | The CSS for **Page1** and its dependencies (includes third-party `glider-js/glider.min.css`).                                                       | Yes         |
| `6.[hash].chunk.js`  | The JavaScript for **Page2**                                                                                                                        | Yes         |
| `6.[hash].chunk.css` | The CSS for **Page2**                                                                                                                               | Yes         |
| `7.[hash].chunk.js`  | The JavaScript for **Page3** including the unused named export from `../glider-named-export`.                                                       | Yes         |
| `7.[hash].chunk.css` | The CSS for **Page3**                                                                                                                               | Yes         |

---

### Will stylesheets be bundled in separate chunks?

If one or more stylesheets are imported in a single module or its dependencies, then a reference to the bundled stylesheet will only be included in that module's chunk. For clarity, a chunk may consist of more than one file (JS & CSS).

In our example, [**Page1**](https://github.com/kevinfarrugia/code-splitting-demo/blob/master/src/js/components/page1/index.jsx) imports a stylesheet:

```
import styles from "./style.scss";
```

As it is the only file which references this stylesheet, then it will be chunked. Additionally, **Page1** is the only module which imports the [**Glider**](https://github.com/kevinfarrugia/code-splitting-demo/blob/master/src/js/components/glider/index.jsx) component; which in turn imports another two stylesheets and also has a dependency on the third-party [glider-js](https://github.com/NickPiscitelli/Glider.js).

**src/js/components/glider/index.jsx**

```
import "glider-js";
import "glider-js/glider.min.css";
```

✅ All these will be included in a single chunk, together with the `style.scss` above.

✅ On the contrary, if a stylesheet is imported in more than one module, then the bundler will output a single stylsheet referenced by both modules.

In our example, [**Page2**](https://github.com/kevinfarrugia/code-splitting-demo/blob/master/src/js/components/page2/index.jsx) imports a shared stylesheet:

```
import sharedStyles from "../home/style.scss";
```

✅ This stylesheet is also imported in the [**Home**](https://github.com/kevinfarrugia/code-splitting-demo/blob/master/src/js/components/home/index.jsx) module and therefore is not included in the **Page2** chunk.

### What about images?

By design, images are only downloaded when needed and present in the DOM. This means that images should have no impact on your bundle sizes.

✅ If you are importing your images using file-loader's [`esModule`](https://webpack.js.org/loaders/file-loader/#esmodule) then you will also benefit from module concatenation and tree-shaking on used images, but this is not code-splitting.

❌ However, if you are using [url-loader](https://webpack.js.org/loaders/url-loader/) and your images are being encoded into Base64 or SVG strings, then they will be encoded into each chunk resulting in duplicate code.

### May I use CommonJS imports?

✅ Yes, CommonJS & ES6 module imports work equally well.

In our example, in **Page2** the below two lines would result in equivalent chunks:

```
const styles = require("./style.scss");
// import styles from "./style.scss");
```

### When using route-based code-splitting, is it possible to have some routes lazy-loaded while others loaded regularly?

✅ Yes, definitely.

In this example, the **Home** module is loaded regularly while the other pages are loaded lazily.

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

### Does code-splitting work with named exports?

✅ `React.lazy` requires you to have a default export, however you may still use named exports for other components, even for those which are being referenced by the lazily loaded component.

### What about re-exporting? Will `export * from "./my-module"` be tree-shaken?

⚠ Using `export * from "./my-module"` means that any export in `./my-module`, regardless of whether it is used or unused, would need to be evaluated and executed in case one of those exports has side-effects. As a result, you need to explicitly inform Webpack that the file has no side-effects using the `sideEffects` **package.json** property. Sean Larkin has an excellent explanation on [Stack Overflow](https://stackoverflow.com/a/49203452/2315681).

The example code includes a component [**Page3**](https://github.com/kevinfarrugia/code-splitting-demo/blob/master/src/js/components/page3/page3.jsx) which exports an unused component [**../glider-named-export**](https://github.com/kevinfarrugia/code-splitting-demo/blob/master/src/js/components/glider-named-export/index.jsx). Without `sideEffects: false`, the resultant chunk includes the contents of **../glider-named-export**, even if it is never actually being used.

_Note that the package.json for this demo project has `sideEffects: false` by default, but in a new project it needs to be set explicitly._

*Edit (2020-11-16): Will need to confirm if this still behaves the same in Webpack v5.*

### Does this work with critical (inlined) CSS?

✅ Yes it does.

The configuration used in this demo inlines a single critical CSS file which includes all critical CSS defined across the project. This is done using the following code inside **scripts/webpack.config.js**:

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

_This could possibly be reconfigured to inline a separate CSS file for each route; however I have not experimented with this myself._

### Why did you disable SSR?

I disabled SSR to simplify the demo as ReactDOMServer does not yet support Suspense. This could be mitigated using dynamic imports or [Loadable Components](https://github.com/gregberge/loadable-components).

## Contributing

Anyone and everyone is welcome to contribute to this project and leave feedback. Please take a moment to review the [guidelines for contributing](contributing.md).

## License

Copyright © 2020 Spiffing Ltd. This source code is licensed under the MIT license found in the [LICENSE](LICENSE) file.

---

Please feel free to get in touch with me. Kevin Farrugia ([@imkevdev](https://twitter.com/imkevdev))
