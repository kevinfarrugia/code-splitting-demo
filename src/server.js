import path from "path";

import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import exphbs from "express-handlebars";
import expressStaticGzip from "express-static-gzip";
import helmet from "helmet";
import PrettyError from "pretty-error";

import handleRender from "./render";

const app = express();

// setup express to use handlebars as the templating engine
const hbs = exphbs.create({
  defaultLayout: false,
  extname: ".hbs",
});

app.set("views", path.join(process.env.OUTPUT_DIR, "/public"));
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

// https://helmetjs.github.io/
app.use(helmet());

app.use(
  "/",
  expressStaticGzip(path.join(process.env.OUTPUT_DIR, "/public"), {
    index: false,
    enableBrotli: true,
    orderPreference: ["br", "gz"],
    serveStatic: { maxAge: 2592000000 },
  })
);

app.use(compression());

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(handleRender);

const prettyError = new PrettyError();
prettyError.skipNodeFiles();
prettyError.skipPackage("express");

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(prettyError.render(err));
  res.status(err.status || 500);
  res.send();
});

if (!module.hot) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.info(`The server is running at http://localhost:${port}/`);
  });
}

if (module.hot) {
  app.hot = module.hot;
}

export default app;
