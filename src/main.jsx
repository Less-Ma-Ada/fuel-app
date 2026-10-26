
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { DemoProvider } from "./data/DemoContext.jsx";
import "./index.css";
import "./App.css";
import "./shell.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DemoProvider>
      <App />
    </DemoProvider>
  </React.StrictMode>
);
