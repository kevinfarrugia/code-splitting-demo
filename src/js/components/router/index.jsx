import React, { Suspense } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";

import Home from "../home";

const Page1 = React.lazy(() => import("../page1"));
const Page2 = React.lazy(() => import("../page2"));
const Page3 = React.lazy(() => import("../page3"));

const Router = () => (
  <BrowserRouter>
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/1">Page 1</Link>
        </li>
        <li>
          <Link to="/2">Page 2</Link>
        </li>
        <li>
          <Link to="/3">Page 3</Link>
        </li>
      </ul>
    </nav>
    <Suspense fallback={null}>
      <Switch>
        <Route path="/1" exact>
          <Page1 />
        </Route>
        <Route path="/2" exact>
          <Page2 />
        </Route>
        <Route path="/3" exact>
          <Page3 />
        </Route>
        <Route>
          <Home />
        </Route>
      </Switch>
    </Suspense>
  </BrowserRouter>
);

export default Router;
