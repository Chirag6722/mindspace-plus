# MindSpace+

An infinite-canvas notes app built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- **Infinite canvas** — pan by dragging the background, zoom with the scroll wheel.
- **Sticky notes** with four templates (Note, To-do, Idea, Reminder), 7 colors, rich text formatting (bold/italic/underline/strikethrough/lists), checklists, tags, star/pin, and due dates.
- **Connections** — link related notes with the 🔗 tool to build mind-maps; double-click a connection to label it, click to remove.
- **Boards** — organize notes into separate boards/folders via the sidebar; each board keeps its own notes, connections, and viewport.
- **Search & filters** — search across titles, content, tags, and checklist items; filter by starred, checklists, or overdue.
- **Minimap** — quick overview of the whole board with click-to-navigate.
- **Export / Import**
  - Export a board (or all boards) as **JSON** for backup/sharing.
  - Export a board as **Markdown** (outline of notes, checklists, tags, and connections).
  - Export a board as a **PNG image** snapshot.
  - Import a previously exported JSON file (single board or full backup).
- **Dark mode** toggle, with your preference remembered.
- Everything is saved automatically to your browser's local storage.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

## Tech stack

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) icons
- [html-to-image](https://github.com/bubkoo/html-to-image) for PNG export

## Notes

- All data is stored locally in your browser (`localStorage`). Clearing site data will remove your boards — use the export feature to back up important boards.
- Keyboard shortcuts: `Delete`/`Backspace` removes the selected note, `Esc` deselects and exits link mode.
