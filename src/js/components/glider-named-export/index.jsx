/* eslint-disable */
import "glider-js";
import "glider-js/glider.min.css";

import React from "react";

export const GliderComponent = React.forwardRef((props, ref) => {
  const innerRef = React.useRef(null);
  const gliderRef = React.useRef();
  const isMountedRef = React.useRef(false);
  const makeGliderOptions = () => ({
    ...props,
    arrows:
      (props.hasArrows && {
        next:
          (props.arrows && props.arrows.next && props.arrows.next) ||
          ".glider-next",
        prev:
          (props.arrows && props.arrows.prev && props.arrows.prev) ||
          ".glider-prev",
      }) ||
      undefined,
    dots: (props.hasDots && props.dots) || "#dots" || undefined,
  });
  // On mount initialize the glider and hook up events
  React.useLayoutEffect(() => {
    if (!innerRef.current) {
      return;
    }
    // @ts-ignore
    const glider = new Glider(innerRef.current, makeGliderOptions());
    gliderRef.current = glider;
    const addEventListener = (event, fn) => {
      if (typeof fn === "function" && innerRef.current) {
        innerRef.current.addEventListener(event, fn);
      }
    };
    addEventListener("glider-slide-visible", props.onSlideVisible);
    addEventListener("glider-loaded", props.onLoad);
    addEventListener("glider-animated", props.onAnimated);
    addEventListener("glider-remove", props.onRemove);
    addEventListener("glider-refresh", props.onRefresh);
    addEventListener("glider-add", props.onAdd);
    addEventListener("glider-destroy", props.onDestroy);
    addEventListener("glider-slide-hidden", props.onSlideHidden);
    if (props.scrollToSlide) {
      glider.scrollItem(props.scrollToSlide - 1);
    } else if (props.scrollToPage) {
      glider.scrollItem(props.scrollToPage - 1, true);
    }
  }, []);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      const removeEventListener = (event, fn) => {
        if (typeof fn === "function" && innerRef.current) {
          innerRef.current.removeEventListener(event, fn);
        }
      };
      removeEventListener("glider-slide-visible", props.onSlideVisible);
      removeEventListener("glider-loaded", props.onLoad);
      removeEventListener("glider-animated", props.onAnimated);
      removeEventListener("glider-remove", props.onRemove);
      removeEventListener("glider-refresh", props.onRefresh);
      removeEventListener("glider-add", props.onAdd);
      removeEventListener("glider-destroy", props.onDestroy);
      removeEventListener("glider-slide-hidden", props.onSlideHidden);
      if (gliderRef.current) {
        gliderRef.current.destroy();
      }
    };
  }, []);
  // When the props update, update the glider
  React.useEffect(() => {
    if (!(gliderRef.current && isMountedRef.current)) {
      return;
    }
    gliderRef.current.setOption(makeGliderOptions(), true);
    gliderRef.current.refresh(true);
  }, [props]);
  // Expose the glider instance to the user so they can call the methods too
  React.useImperativeHandle(ref, () => gliderRef.current);
  return React.createElement(
    "div",
    { className: "glider-contain" },
    props.hasArrows &&
      !props.arrows &&
      React.createElement(
        "button",
        { role: "button", className: "glider-prev", id: "glider-prev" },
        props.iconLeft || "«"
      ),
    React.createElement(
      "div",
      { className: props.className, ref: innerRef },
      props.children
    ),
    props.hasDots && !props.dots && React.createElement("div", { id: "dots" }),
    props.hasArrows &&
      !props.arrows &&
      React.createElement(
        "button",
        { role: "button", className: "glider-next", id: "glider-next" },
        props.iconRight || "»"
      )
  );
});

export default GliderComponent;
