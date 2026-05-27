import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

export function RouteFocus() {
  const location = useLocation();

  useEffect(() => {
    const heading = document.querySelector("main h1, main h2, [role='main'] h1, [role='main'] h2");
    if (!(heading instanceof HTMLElement)) return;
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }, [location.pathname]);

  return null;
}
