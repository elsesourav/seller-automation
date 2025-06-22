import React from "react";
import { createRoot } from "react-dom/client";
import OptionsApp from "./OptionsApp.jsx";
import "./index.css";

const container = document.getElementById("options-root");
const root = createRoot(container);

root.render(
   <React.StrictMode>
      <OptionsApp />
   </React.StrictMode>
);
