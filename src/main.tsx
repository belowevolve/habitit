import { connectLogger } from "@reatom/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./app.tsx";

if (import.meta.env.DEV) {
  connectLogger();
}

const root = document.querySelector("#root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
