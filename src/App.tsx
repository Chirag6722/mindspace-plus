import { useEffect, useRef, useState } from 'react';
import { FilterState, NoteTemplate, Viewport } from '@/types';
import { useBoards } from '@/hooks/useBoards';
import { useElementSize } from '@/hooks/useElementSize';
import { createNote, defaultNoteSize, templateDefaultColor } from '@/lib/factories';
import { clamp } from '@/lib/utils';
import { computeVisibleNoteIds } from '@/lib/filters';
import {
  exportAllJSON,
  exportBoardJSON,
  exportBoardMarkdown,
  exportElementAsImage,
  parseImportFile,
} from '@/lib/exportImport';
import { InfiniteCanvas } from '@/components/Canvas';
import { Sidebar } from '@/components/Sidebar';
import { Toolbar } from '@/components/Toolbar';
import { Minimap } from '@/components/Minimap';
import { StatusBar } from '@/components/StatusBar';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

const THEME_KEY = 'mindspace-plus:theme';

function getInitialTheme(): boolean {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved === 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export default function App() {
  const {
    boards,
    activeBoard,
    addBoard,
    renameBoard,
    deleteBoard,
    setActiveBoardId,
    setViewport,
    addNote,
    updateNote,
    deleteNote,
    bringToFront,
    addConnection,
    updateConnection,
    deleteConnection,
    replaceAll,
    importBoard,
    data,
  } = useBoards();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectMode, setConnectMode] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(getInitialTheme);
  const [pendingAppImport, setPendingAppImport] = useState<{ data: typeof data } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    searchTerm: '',
    selectedTags: [],
    showStarred: false,
    activeFilter: 'all',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useElementSize(containerRef);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Deselect / reset connect mode when switching boards
  useEffect(() => {
    setSelectedNoteId(null);
    setConnectMode(false);
  }, [activeBoard.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'Escape') {
        setConnectMode(false);
        setSelectedNoteId(null);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNoteId && !isEditing) {
        e.preventDefault();
        deleteNote(selectedNoteId);
        setSelectedNoteId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedNoteId, deleteNote]);

  const { viewport } = activeBoard;

  // ---- Note creation ----
  const handleAddNote = (template: NoteTemplate) => {
    const { width, height } = defaultNoteSize(template);
    const jitter = (Math.random() - 0.5) * 60;
    const canvasCenterX = (containerSize.width / 2 - viewport.x) / viewport.zoom;
    const canvasCenterY = (containerSize.height / 2 - viewport.y) / viewport.zoom;

    const note = createNote({
      template,
      color: templateDefaultColor(template),
      width,
      height,
      x: canvasCenterX - width / 2 + jitter,
      y: canvasCenterY - height / 2 + jitter,
    });
    addNote(note);
    setSelectedNoteId(note.id);
  };

  // ---- Zoom controls ----
  const zoomBy = (factor: number) => {
    const cx = containerSize.width / 2;
    const cy = containerSize.height / 2;
    const newZoom = clamp(viewport.zoom * factor, 0.25, 2.5);
    const canvasX = (cx - viewport.x) / viewport.zoom;
    const canvasY = (cy - viewport.y) / viewport.zoom;
    setViewport({ zoom: newZoom, x: cx - canvasX * newZoom, y: cy - canvasY * newZoom });
  };

  const zoomReset = () => {
    if (Math.abs(viewport.zoom - 1) < 0.01) {
      setViewport({ ...viewport, x: 0, y: 0 });
      return;
    }
    const cx = containerSize.width / 2;
    const cy = containerSize.height / 2;
    const canvasX = (cx - viewport.x) / viewport.zoom;
    const canvasY = (cy - viewport.y) / viewport.zoom;
    setViewport({ zoom: 1, x: cx - canvasX, y: cy - canvasY });
  };

  // ---- Export / Import ----
  const handleExportImage = async () => {
    if (!containerRef.current) return;
    try {
      await exportElementAsImage(containerRef.current, `${activeBoard.name.toLowerCase().replace(/\s+/g, '-')}.png`);
    } catch (err) {
      console.error(err);
      setImportError('Could not export image. Try again, or use a smaller board.');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await parseImportFile(file);
      if (result.kind === 'board') {
        importBoard(result.board);
      } else {
        setPendingAppImport({ data: result.data });
      }
    } catch (err) {
      console.error(err);
      setImportError('That file could not be read. Make sure it is a MindSpace+ export.');
    }
  };

  const visibleNoteIds = computeVisibleNoteIds(activeBoard, filter);
  const searchActive = filter.searchTerm.trim().length > 0 || filter.activeFilter !== 'all';

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-canvas-light text-neutral-800 dark:bg-canvas-dark dark:text-neutral-100">
      <div ref={containerRef} className="absolute inset-0">
        <InfiniteCanvas
          board={activeBoard}
          visibleNoteIds={visibleNoteIds}
          connectMode={connectMode}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          onUpdateNote={updateNote}
          onDeleteNote={(id) => {
            deleteNote(id);
            if (selectedNoteId === id) setSelectedNoteId(null);
          }}
          onBringToFront={bringToFront}
          onAddConnection={addConnection}
          onDeleteConnection={deleteConnection}
          onUpdateConnection={updateConnection}
          onSetViewport={setViewport}
        />
      </div>

      <Sidebar
        boards={boards}
        activeBoardId={activeBoard.id}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onSelect={setActiveBoardId}
        onAdd={() => addBoard('New Board')}
        onRename={renameBoard}
        onDelete={deleteBoard}
      />

      <Toolbar
        connectMode={connectMode}
        onToggleConnectMode={() => setConnectMode((v) => !v)}
        onAddNote={handleAddNote}
        searchTerm={filter.searchTerm}
        onSearchChange={(searchTerm) => setFilter((f) => ({ ...f, searchTerm }))}
        activeFilter={filter.activeFilter}
        onFilterChange={(activeFilter) => setFilter((f) => ({ ...f, activeFilter }))}
        zoom={viewport.zoom}
        onZoomIn={() => zoomBy(1.2)}
        onZoomOut={() => zoomBy(1 / 1.2)}
        onZoomReset={zoomReset}
        onExportBoardJSON={() => exportBoardJSON(activeBoard)}
        onExportAllJSON={() => exportAllJSON(data)}
        onExportMarkdown={() => exportBoardMarkdown(activeBoard)}
        onExportImage={handleExportImage}
        onImport={handleImport}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
      />

      <StatusBar board={activeBoard} filteredCount={visibleNoteIds?.size ?? activeBoard.notes.length} searchActive={searchActive} />

      <Minimap
        notes={activeBoard.notes}
        viewport={viewport}
        containerSize={containerSize}
        onNavigate={(v: Viewport) => setViewport(v)}
      />

      {/* Confirm replacing all data on full-app import */}
      <Dialog
        open={!!pendingAppImport}
        onClose={() => setPendingAppImport(null)}
        title="Replace all boards?"
        description="This file contains a full MindSpace+ backup. Importing it will replace every board currently open."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setPendingAppImport(null)}>
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={() => {
              if (pendingAppImport) replaceAll(pendingAppImport.data);
              setPendingAppImport(null);
            }}
          >
            Replace boards
          </Button>
        </div>
      </Dialog>

      {/* Import / export error */}
      <Dialog open={!!importError} onClose={() => setImportError(null)} title="Something went wrong">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{importError}</p>
        <div className="flex justify-end pt-3">
          <Button variant="solid" onClick={() => setImportError(null)}>
            OK
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
