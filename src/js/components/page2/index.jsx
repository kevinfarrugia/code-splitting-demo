import React from "react";

import image3 from "../../../img/photo-1604431781376-b72d64a43fc2.jpeg";
// eslint-disable-next-line css-modules/no-unused-class
import sharedStyles from "../home/style.scss";
import styles from "./style.scss";

// const styles = require("./style.scss");

const Component = () => (
  <div className={sharedStyles.container}>
    <h1 className={sharedStyles.title}>Page 2</h1>
    <div className={styles.slide}>
      <img className={styles.image} src={image3} alt="1" />
    </div>
  </div>
);

export default Component;
