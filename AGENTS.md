# AGENTS.md — VerScript Web IDE

Instructions and context for autonomous AI coding agents (such as Google Jules).

## 🚀 Dev Environment & Commands
- **Install Dependencies**: `npm install`
- **Start Dev Server**: `npm run dev`
- **Build Production Bundle**: `npm run build`
- **Output Directory**: Output bundle is compiled to the `dist/` directory.

## 🏗️ Architecture & Configuration
- React web app built with Vite.
- Uses `@monaco-editor/react` for the code editor space.
- **Backend URL**: Points to the PolyServer instance via:
  `const VS_SHARP_API = 'https://verscript-polyserver.onrender.com/vs-sharp';`
  Do not hardcode localhost URLs.

## 🛡️ Coding Guidelines & Rules
- **CSS Styling**: Keep the IDE visually premium, modern, responsive, and mobile-friendly. Styling configurations are structured in `src/index.css` and `src/assets/mobile.css`. Do not bypass these styling layers.
- **Direct Codespace Writing**: The IDE intercepts the AI assistant chat responses. If a response action contains `{ type: 'edit', code: '...' }`, it initiates a typewriter-style animated text transition to write the code block directly into Monaco. Keep this event intercept hook intact.
- **SEO Elements**: Keep description metadata and title matching conventions.
