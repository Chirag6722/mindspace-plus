import { useRef } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Note, Viewport } from '@/types';
import { NOTE_COLOR_CLASSES } from '@/lib/colors';
import { clamp } from '@/lib/utils';

interface MinimapProps {
  notes: Note[];
  viewport: Viewport;
  containerSize: { width: number; height: number };
  onNavigate: (viewport: Viewport) => void;
}

const MAP_W = 180;
const MAP_H = 120;
const PADDING = 150;

export function Minimap({ notes, viewport, containerSize, onNavigate }: MinimapProps) {
  const ref = useRef<HTMLDivElement>(null);

  if (containerSize.width === 0) return null;

  // Compute bounding box of all notes plus the current viewport.
  const visible = {
    minX: -viewport.x / viewport.zoom,
    minY: -viewport.y / viewport.zoom,
    maxX: (-viewport.x + containerSize.width) / viewport.zoom,
    maxY: (-viewport.y + containerSize.height) / viewport.zoom,
  };

  let minX = visible.minX;
  let minY = visible.minY;
  let maxX = visible.maxX;
  let maxY = visible.maxY;

  for (const n of notes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  }

  minX -= PADDING;
  minY -= PADDING;
  maxX += PADDING;
  maxY += PADDING;

  const boundWidth = Math.max(1, maxX - minX);
  const boundHeight = Math.max(1, maxY - minY);
  const scale = Math.min(MAP_W / boundWidth, MAP_H / boundHeight);

  const offsetX = (MAP_W - boundWidth * scale) / 2;
  const offsetY = (MAP_H - boundHeight * scale) / 2;

  const toMap = (x: number, y: number) => ({
    left: offsetX + (x - minX) * scale,
    top: offsetY + (y - minY) * scale,
  });

  const viewportRect = {
    ...toMap(visible.minX, visible.minY),
    width: (visible.maxX - visible.minX) * scale,
    height: (visible.maxY - visible.minY) * scale,
  };

  const navigate = (clientX: number, clientY: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mapX = clamp(clientX - rect.left, 0, MAP_W);
    const mapY = clamp(clientY - rect.top, 0, MAP_H);
    const canvasX = minX + (mapX - offsetX) / scale;
    const canvasY = minY + (mapY - offsetY) / scale;

    onNavigate({
      ...viewport,
      x: containerSize.width / 2 - canvasX * viewport.zoom,
      y: containerSize.height / 2 - canvasY * viewport.zoom,
    });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    navigate(e.clientX, e.clientY);
    const onMove = (ev: MouseEvent) => navigate(ev.clientX, ev.clientY);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="absolute bottom-3 right-3 z-30 overflow-hidden rounded-xl border border-neutral-200 bg-white/90 p-1.5 shadow-panel backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/90">
      <div className="mb-1 flex items-center gap-1 px-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
        <MapIcon className="h-3 w-3" /> Map
      </div>
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        className="relative cursor-pointer rounded-md bg-black/[0.03] dark:bg-white/[0.04]"
        style={{ width: MAP_W, height: MAP_H }}
      >
        {notes.map((n) => {
          const pos = toMap(n.x, n.y);
          return (
            <div
              key={n.id}
              className={`absolute rounded-[2px] ${NOTE_COLOR_CLASSES[n.color].swatch}`}
              style={{
                left: pos.left,
                top: pos.top,
                width: Math.max(2, n.width * scale),
                height: Math.max(2, n.height * scale),
              }}
            />
          );
        })}
        <div
          className="pointer-events-none absolute rounded-sm border-[1.5px] border-blue-500/80"
          style={{
            left: clamp(viewportRect.left, 0, MAP_W),
            top: clamp(viewportRect.top, 0, MAP_H),
            width: clamp(viewportRect.width, 0, MAP_W),
            height: clamp(viewportRect.height, 0, MAP_H),
          }}
        />
      </div>
    </div>
  );
}
