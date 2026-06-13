import { Board, Connection, Note, NoteColor, NoteTemplate } from '@/types';
import { nowISO, uid } from './utils';

export function createNote(overrides: Partial<Note> = {}): Note {
  const ts = nowISO();
  return {
    id: uid('note_'),
    x: 0,
    y: 0,
    width: 220,
    height: 200,
    rotation: (Math.random() * 4 - 2) | 0,
    color: 'yellow',
    template: 'note',
    title: '',
    content: '',
    checklist: [],
    tags: [],
    starred: false,
    dueDate: null,
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

export function createConnection(from: string, to: string, overrides: Partial<Connection> = {}): Connection {
  return {
    id: uid('conn_'),
    from,
    to,
    label: '',
    color: '#9aa1ad',
    ...overrides,
  };
}

const BOARD_EMOJIS = ['🧠', '📌', '🗂️', '✨', '🚀', '🌱', '📚', '🎯'];

export function createBoard(name = 'New Board', overrides: Partial<Board> = {}): Board {
  const ts = nowISO();
  return {
    id: uid('board_'),
    name,
    emoji: BOARD_EMOJIS[Math.floor(Math.random() * BOARD_EMOJIS.length)],
    notes: [],
    connections: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

export function defaultNoteSize(template: NoteTemplate): { width: number; height: number } {
  switch (template) {
    case 'todo':
      return { width: 240, height: 220 };
    case 'idea':
      return { width: 240, height: 200 };
    case 'reminder':
      return { width: 220, height: 180 };
    default:
      return { width: 220, height: 200 };
  }
}

export function templateDefaultColor(template: NoteTemplate): NoteColor {
  switch (template) {
    case 'todo':
      return 'blue';
    case 'idea':
      return 'purple';
    case 'reminder':
      return 'orange';
    default:
      return 'yellow';
  }
}

/** Seed data shown on first run. */
export function createWelcomeBoard(): Board {
  const board = createBoard('Welcome', { emoji: '👋' });

  const n1 = createNote({
    x: -260,
    y: -140,
    color: 'yellow',
    template: 'note',
    title: 'Welcome to MindSpace+',
    content:
      '<p>This is an <strong>infinite canvas</strong> for your notes.</p><p>Drag the background to pan, scroll to zoom, and drag notes to move them.</p>',
    rotation: -2,
  });

  const n2 = createNote({
    x: 80,
    y: -180,
    color: 'blue',
    template: 'todo',
    title: 'Try these features',
    content: '<p>Check off items, link notes together, and organize with boards.</p>',
    checklist: [
      { id: uid('item_'), text: 'Drag a note around the canvas', done: false },
      { id: uid('item_'), text: 'Double-click a note to edit it', done: false },
      { id: uid('item_'), text: 'Use the link tool to connect two notes', done: false },
      { id: uid('item_'), text: 'Create a new board from the sidebar', done: false },
    ],
    rotation: 2,
  });

  const n3 = createNote({
    x: -120,
    y: 120,
    color: 'purple',
    template: 'idea',
    title: 'Idea: export your board',
    content: '<p>Use the export menu to save this board as <em>JSON</em>, <em>Markdown</em>, or a <em>PNG image</em>.</p>',
    rotation: -3,
  });

  const n4 = createNote({
    x: 200,
    y: 120,
    color: 'green',
    template: 'reminder',
    title: 'Reminder',
    content: '<p>Tag notes and star important ones to find them fast.</p>',
    tags: ['getting-started'],
    starred: true,
    rotation: 3,
  });

  board.notes = [n1, n2, n3, n4];
  board.connections = [
    createConnection(n1.id, n2.id, { label: 'next' }),
    createConnection(n2.id, n3.id),
    createConnection(n2.id, n4.id),
  ];

  return board;
}
