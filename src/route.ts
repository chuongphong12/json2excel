import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import App from "./App";

// Lazy load page components for code splitting
const Home = lazy(() => import("./pages/Home"));

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: Home,
      },
    ],
  },
]);

export default router;
