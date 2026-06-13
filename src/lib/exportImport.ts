import { toPng } from 'html-to-image';
import { AppData, Board, Note } from '@/types';
import { TEMPLATE_LABELS } from '@/types';

function download(filename: string, content: string | Blob, mime = 'application/octet-stream') {
  const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'board';
}

/** Export a single board as a JSON file. */
export function exportBoardJSON(board: Board) {
  download(`${slugify(board.name)}.mindspace.json`, JSON.stringify({ kind: 'board', board }, null, 2), 'application/json');
}

/** Export the entire app (all boards) as a JSON file. */
export function exportAllJSON(data: AppData) {
  download('mindspace-backup.json', JSON.stringify({ kind: 'app', data }, null, 2), 'application/json');
}

/** Parse an imported JSON file. Returns either a single board or full app data. */
export async function parseImportFile(file: File): Promise<{ kind: 'board'; board: Board } | { kind: 'app'; data: AppData }> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (parsed.kind === 'board' && parsed.board) {
    return { kind: 'board', board: parsed.board as Board };
  }
  if (parsed.kind === 'app' && parsed.data) {
    return { kind: 'app', data: parsed.data as AppData };
  }
  // Fallback: assume it's a raw board object
  if (parsed.notes && parsed.viewport) {
    return { kind: 'board', board: parsed as Board };
  }
  throw new Error('Unrecognized file format');
}

export function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || '').replace(/\s+\n/g, '\n').trim();
}

/** Export a board's notes as a structured Markdown outline. */
export function exportBoardMarkdown(board: Board) {
  const lines: string[] = [];
  lines.push(`# ${board.name}`);
  lines.push('');

  const sorted = [...board.notes].sort((a, b) => a.y - b.y || a.x - b.x);

  for (const note of sorted) {
    const heading = note.title || TEMPLATE_LABELS[note.template];
    const flags: string[] = [];
    if (note.starred) flags.push('★');
    if (note.dueDate) flags.push(`due ${note.dueDate}`);
    const suffix = flags.length ? ` _(${flags.join(', ')})_` : '';
    lines.push(`## ${heading}${suffix}`);

    const text = stripHtml(note.content);
    if (text) {
      lines.push('');
      lines.push(text);
    }

    if (note.checklist.length) {
      lines.push('');
      for (const item of note.checklist) {
        lines.push(`- [${item.done ? 'x' : ' '}] ${item.text}`);
      }
    }

    if (note.tags.length) {
      lines.push('');
      lines.push(note.tags.map((t) => `\`#${t}\``).join(' '));
    }

    lines.push('');
  }

  // Connections section
  if (board.connections.length) {
    lines.push('---');
    lines.push('');
    lines.push('## Connections');
    lines.push('');
    const byId = new Map<string, Note>(board.notes.map((n) => [n.id, n]));
    for (const conn of board.connections) {
      const from = byId.get(conn.from);
      const to = byId.get(conn.to);
      if (!from || !to) continue;
      const fromLabel = from.title || TEMPLATE_LABELS[from.template];
      const toLabel = to.title || TEMPLATE_LABELS[to.template];
      const label = conn.label ? ` (${conn.label})` : '';
      lines.push(`- ${fromLabel} → ${toLabel}${label}`);
    }
    lines.push('');
  }

  download(`${slugify(board.name)}.md`, lines.join('\n'), 'text/markdown');
}

/** Export a DOM node (the canvas) as a PNG snapshot. */
export async function exportElementAsImage(el: HTMLElement, filename: string) {
  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: getComputedStyle(el).backgroundColor || '#f6f4ef',
  });
  download(filename, dataURLtoBlob(dataUrl), 'image/png');
}

function dataURLtoBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*);base64/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
