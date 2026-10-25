import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { Boundary } from "./components/Boundary.tsx";
import { LocaleProvider } from "./lib/locale.tsx";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Boundary>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </Boundary>
    </StrictMode>,
  );
}
