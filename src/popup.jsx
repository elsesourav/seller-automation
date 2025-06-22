import React from "react";
import { createRoot } from "react-dom/client";
import PopupApp from "./PopupApp.jsx";
import "./index.css";

const container = document.getElementById("popup-root");
const root = createRoot(container);

root.render(
   <React.StrictMode>
      <PopupApp />
   </React.StrictMode>
);
