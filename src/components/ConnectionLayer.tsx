import { Connection, Note } from '@/types';

interface Point {
  x: number;
  y: number;
}

interface ConnectionLayerProps {
  notes: Note[];
  connections: Connection[];
  pendingFrom: string | null;
  pendingPoint: Point | null;
  onDeleteConnection: (id: string) => void;
  onLabelConnection: (id: string, label: string) => void;
}

const BOUNDS = 6000;

function center(note: Note): Point {
  return { x: note.x + note.width / 2, y: note.y + note.height / 2 };
}

export function ConnectionLayer({
  notes,
  connections,
  pendingFrom,
  pendingPoint,
  onDeleteConnection,
  onLabelConnection,
}: ConnectionLayerProps) {
  const byId = new Map(notes.map((n) => [n.id, n]));
  const fromNote = pendingFrom ? byId.get(pendingFrom) : undefined;

  return (
    <svg
      className="pointer-events-none absolute"
      style={{ left: -BOUNDS, top: -BOUNDS, width: BOUNDS * 2, height: BOUNDS * 2 }}
      viewBox={`${-BOUNDS} ${-BOUNDS} ${BOUNDS * 2} ${BOUNDS * 2}`}
    >
      <defs>
        <marker id="arrow-end" markerWidth="9" markerHeight="9" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
        </marker>
      </defs>

      {connections.map((conn) => {
        const a = byId.get(conn.from);
        const b = byId.get(conn.to);
        if (!a || !b) return null;
        const p1 = center(a);
        const p2 = center(b);
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        return (
          <g key={conn.id} className="text-neutral-400 dark:text-neutral-500">
            {/* Visible line */}
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="currentColor"
              strokeWidth={2}
              markerEnd="url(#arrow-end)"
            />
            {/* Invisible hit area for click-to-delete / double-click-to-label */}
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="transparent"
              strokeWidth={16}
              className="pointer-events-auto cursor-pointer"
              onClick={() => onDeleteConnection(conn.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                const next = window.prompt('Connection label', conn.label);
                if (next !== null) onLabelConnection(conn.id, next);
              }}
            >
              <title>Click to remove · double-click to label</title>
            </line>
            {conn.label && (
              <g>
                <rect
                  x={mid.x - conn.label.length * 3.2 - 4}
                  y={mid.y - 9}
                  width={conn.label.length * 6.4 + 8}
                  height={16}
                  rx={6}
                  className="fill-white dark:fill-neutral-800"
                  stroke="currentColor"
                  strokeWidth={1}
                />
                <text x={mid.x} y={mid.y + 3} textAnchor="middle" fontSize="10" className="fill-current">
                  {conn.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Pending connection preview */}
      {fromNote && pendingPoint && (
        <line
          x1={center(fromNote).x}
          y1={center(fromNote).y}
          x2={pendingPoint.x}
          y2={pendingPoint.y}
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      )}
    </svg>
  );
}
