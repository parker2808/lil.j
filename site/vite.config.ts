import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

/** First paint uses the Vietnamese title and description from content.json. */
function contentMeta(): Plugin {
  const file = fileURLToPath(new URL("./content.json", import.meta.url));
  return {
    name: "content-meta",
    transformIndexHtml(html) {
      const content = JSON.parse(readFileSync(file, "utf8")) as {
        meta: { docTitle: { vi: string }; description: { vi: string } };
      };
      return html
        .replaceAll("__CONTENT_TITLE__", escapeHtml(content.meta.docTitle.vi))
        .replaceAll("__CONTENT_DESCRIPTION__", escapeHtml(content.meta.description.vi));
    },
  };
}

export default defineConfig({
  plugins: [contentMeta(), react()],
});
