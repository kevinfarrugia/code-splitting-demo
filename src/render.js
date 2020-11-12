/*
 * Render React application middleware
 */
import Helmet from "react-helmet";

const handleRender = (req, res) => {
  // const html = renderToString(<App />);

  const helmet = Helmet.renderStatic();

  // Send the rendered page back to the client using the server's view engine
  res.render("index", {
    htmlAttributes: helmet.htmlAttributes,
    bodyAttributes: helmet.bodyAttributes,
    head: `${helmet.title} ${helmet.meta} ${helmet.link}`,
  });
};

export default handleRender;
