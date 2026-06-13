import { useEffect, useRef, useState } from 'react';
import { Board, Connection, Note, Viewport } from '@/types';
import { clamp } from '@/lib/utils';
import { NoteCard } from './NoteCard';
import { ConnectionLayer } from './ConnectionLayer';

interface CanvasProps {
  board: Board;
  visibleNoteIds: Set<string> | null;
  connectMode: boolean;
  selectedNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onUpdateNote: (id: string, partial: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onBringToFront: (id: string) => void;
  onAddConnection: (from: string, to: string) => void;
  onDeleteConnection: (id: string) => void;
  onUpdateConnection: (id: string, partial: Partial<Connection>) => void;
  onSetViewport: (viewport: Viewport) => void;
}

export function InfiniteCanvas({
  board,
  visibleNoteIds,
  connectMode,
  selectedNoteId,
  onSelectNote,
  onUpdateNote,
  onDeleteNote,
  onBringToFront,
  onAddConnection,
  onDeleteConnection,
  onUpdateConnection,
  onSetViewport,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport } = board;
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const [pendingPoint, setPendingPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!connectMode) setPendingFrom(null);
  }, [connectMode]);

  useEffect(() => {
    setPendingFrom(null);
  }, [board.id]);

  const toCanvasPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    return {
      x: (mouseX - viewport.x) / viewport.zoom,
      y: (mouseY - viewport.y) / viewport.zoom,
    };
  };

  // ---- Panning ----
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-note-card]')) return;

    if (connectMode) {
      if (pendingFrom) setPendingFrom(null);
      return;
    }

    onSelectNote(null);

    const start = { x: e.clientX, y: e.clientY };
    const startViewport = { ...viewport };

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      onSetViewport({ ...startViewport, x: startViewport.x + dx, y: startViewport.y + dy });
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // ---- Zoom (wheel) ----
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const factor = Math.exp(-e.deltaY * 0.0012);
    const newZoom = clamp(viewport.zoom * factor, 0.25, 2.5);

    const canvasX = (mouseX - viewport.x) / viewport.zoom;
    const canvasY = (mouseY - viewport.y) / viewport.zoom;

    onSetViewport({
      zoom: newZoom,
      x: mouseX - canvasX * newZoom,
      y: mouseY - canvasY * newZoom,
    });
  };

  // ---- Track mouse for pending connection preview ----
  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectMode && pendingFrom) {
      setPendingPoint(toCanvasPoint(e.clientX, e.clientY));
    }
  };

  const handleConnectClick = (noteId: string) => {
    if (!pendingFrom) {
      setPendingFrom(noteId);
      return;
    }
    if (pendingFrom === noteId) {
      setPendingFrom(null);
      return;
    }
    onAddConnection(pendingFrom, noteId);
    setPendingFrom(null);
  };

  return (
    <div
      ref={containerRef}
      className={`canvas-bg relative h-full w-full overflow-hidden ${connectMode ? 'connect-mode' : ''}`}
      onMouseDown={handleBackgroundMouseDown}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          width: 1,
          height: 1,
        }}
      >
        <ConnectionLayer
          notes={board.notes}
          connections={board.connections}
          pendingFrom={pendingFrom}
          pendingPoint={pendingPoint}
          onDeleteConnection={onDeleteConnection}
          onLabelConnection={(id, label) => onUpdateConnection(id, { label })}
        />

        {board.notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            zoom={viewport.zoom}
            selected={selectedNoteId === note.id}
            dimmed={visibleNoteIds !== null && !visibleNoteIds.has(note.id)}
            connectMode={connectMode}
            isConnectSource={pendingFrom === note.id}
            onSelect={() => onSelectNote(note.id)}
            onConnectClick={() => handleConnectClick(note.id)}
            onMoveStart={() => {
              onBringToFront(note.id);
              onSelectNote(note.id);
            }}
            onMove={(x, y) => onUpdateNote(note.id, { x, y })}
            onResize={(width, height) => onUpdateNote(note.id, { width, height })}
            onUpdate={(partial) => onUpdateNote(note.id, partial)}
            onDelete={() => onDeleteNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
