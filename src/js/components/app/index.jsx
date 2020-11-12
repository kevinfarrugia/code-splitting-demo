import "./critical.scss";

import React from "react";

import Layout from "../layout";
import Router from "../router";

const App = () => {
  return (
    <Layout meta={{ title: "Code Splitting Demo" }}>
      <Router />
    </Layout>
  );
};

export default App;
