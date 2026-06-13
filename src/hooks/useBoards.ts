import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppData, Board, Connection, Note, Viewport } from '@/types';
import { createBoard, createConnection, createWelcomeBoard } from '@/lib/factories';
import { loadAppData, makeAppData, saveAppData } from '@/lib/storage';
import { nowISO, uid } from '@/lib/utils';

function initialData(): AppData {
  const existing = loadAppData();
  if (existing && existing.boards.length > 0) return existing;
  const board = createWelcomeBoard();
  return makeAppData([board], board.id);
}

export function useBoards() {
  const [data, setData] = useState<AppData>(initialData);

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const activeBoard = useMemo<Board>(() => {
    return data.boards.find((b) => b.id === data.activeBoardId) ?? data.boards[0];
  }, [data]);

  const updateActiveBoard = useCallback((updater: (board: Board) => Board) => {
    setData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) =>
        b.id === prev.activeBoardId ? { ...updater(b), updatedAt: nowISO() } : b
      ),
    }));
  }, []);

  // ---- Board operations ----
  const addBoard = useCallback((name = 'New Board') => {
    const board = createBoard(name);
    setData((prev) => ({
      ...prev,
      boards: [...prev.boards, board],
      activeBoardId: board.id,
    }));
    return board.id;
  }, []);

  const renameBoard = useCallback((id: string, name: string) => {
    setData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) => (b.id === id ? { ...b, name, updatedAt: nowISO() } : b)),
    }));
  }, []);

  const setBoardEmoji = useCallback((id: string, emoji: string) => {
    setData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) => (b.id === id ? { ...b, emoji } : b)),
    }));
  }, []);

  const deleteBoard = useCallback((id: string) => {
    setData((prev) => {
      if (prev.boards.length <= 1) return prev;
      const boards = prev.boards.filter((b) => b.id !== id);
      const activeBoardId = prev.activeBoardId === id ? boards[0].id : prev.activeBoardId;
      return { ...prev, boards, activeBoardId };
    });
  }, []);

  const setActiveBoardId = useCallback((id: string) => {
    setData((prev) => (prev.boards.some((b) => b.id === id) ? { ...prev, activeBoardId: id } : prev));
  }, []);

  const setViewport = useCallback(
    (viewport: Viewport) => {
      updateActiveBoard((b) => ({ ...b, viewport }));
    },
    [updateActiveBoard]
  );

  // ---- Note operations ----
  const addNote = useCallback(
    (note: Note) => {
      updateActiveBoard((b) => ({ ...b, notes: [...b.notes, note] }));
    },
    [updateActiveBoard]
  );

  const updateNote = useCallback(
    (id: string, partial: Partial<Note>) => {
      updateActiveBoard((b) => ({
        ...b,
        notes: b.notes.map((n) => (n.id === id ? { ...n, ...partial, updatedAt: nowISO() } : n)),
      }));
    },
    [updateActiveBoard]
  );

  const deleteNote = useCallback(
    (id: string) => {
      updateActiveBoard((b) => ({
        ...b,
        notes: b.notes.filter((n) => n.id !== id),
        connections: b.connections.filter((c) => c.from !== id && c.to !== id),
      }));
    },
    [updateActiveBoard]
  );

  const bringToFront = useCallback(
    (id: string) => {
      updateActiveBoard((b) => {
        const note = b.notes.find((n) => n.id === id);
        if (!note) return b;
        return { ...b, notes: [...b.notes.filter((n) => n.id !== id), note] };
      });
    },
    [updateActiveBoard]
  );

  // ---- Connection operations ----
  const addConnection = useCallback(
    (from: string, to: string) => {
      if (from === to) return;
      updateActiveBoard((b) => {
        const exists = b.connections.some(
          (c) => (c.from === from && c.to === to) || (c.from === to && c.to === from)
        );
        if (exists) return b;
        return { ...b, connections: [...b.connections, createConnection(from, to)] };
      });
    },
    [updateActiveBoard]
  );

  const updateConnection = useCallback(
    (id: string, partial: Partial<Connection>) => {
      updateActiveBoard((b) => ({
        ...b,
        connections: b.connections.map((c) => (c.id === id ? { ...c, ...partial } : c)),
      }));
    },
    [updateActiveBoard]
  );

  const deleteConnection = useCallback(
    (id: string) => {
      updateActiveBoard((b) => ({ ...b, connections: b.connections.filter((c) => c.id !== id) }));
    },
    [updateActiveBoard]
  );

  // ---- Import / export ----
  const replaceAll = useCallback((next: AppData) => {
    setData(next);
  }, []);

  const importBoard = useCallback((board: Board) => {
    const fresh: Board = { ...board, id: uid('board_') };
    setData((prev) => ({ ...prev, boards: [...prev.boards, fresh], activeBoardId: fresh.id }));
  }, []);

  return {
    data,
    boards: data.boards,
    activeBoard,
    addBoard,
    renameBoard,
    setBoardEmoji,
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
  };
}
