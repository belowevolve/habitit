import "@/shared/lib/reatom-setup";
import { createRoot } from "react-dom/client";

import "./index.css";
import { App } from "./app.tsx";

const root = document.querySelector("#root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<App />);
