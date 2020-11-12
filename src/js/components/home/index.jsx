import React from "react";

// eslint-disable-next-line no-unused-vars
import image1 from "../../../img/photo-1602700986195-61c063fe117f.jpeg";
import Footer from "../footer";
import TodoList from "../todoList";
import styles from "./style.scss";

const Home = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>todos</h1>
    <div className={styles.content}>
      <TodoList />
      <Footer />
    </div>
  </div>
);

export default Home;
