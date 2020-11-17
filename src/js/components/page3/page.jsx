/* eslint-disable import/prefer-default-export */
import React from "react";

import image1 from "../../../img/photo-1602700986195-61c063fe117f.jpeg";
import image2 from "../../../img/photo-1604276919965-7ba5dab422f4.jpeg";
import Glider from "../glider";
import styles from "./style.scss";

export * from "../glider-named-export";

export const Page3 = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Page 1</h1>
    <Glider hasDots slidesToShow={1}>
      <div className={styles.slide}>
        <img className={styles.image} src={image1} alt="1" />
      </div>
      <div className={styles.slide}>
        <img className={styles.image} src={image2} alt="2" />
      </div>
    </Glider>
  </div>
);
