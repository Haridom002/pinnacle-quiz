import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppPreview from "./AppPreview";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppPreview />
  </StrictMode>
);
