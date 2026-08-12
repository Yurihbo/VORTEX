import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.lang = "pt-BR";

// Suporte a SPA no GitHub Pages (redirecionamento via 404.html)
(function () {
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  if (p) {
    window.history.replaceState(null, '', p);
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
