import { useRef } from 'react';
import {
  Plus,
  Search,
  ZoomIn,
  ZoomOut,
  Link2,
  Download,
  Upload,
  Filter,
  Sun,
  Moon,
  StickyNote,
  CheckSquare,
  Lightbulb,
  Bell,
  FileJson,
  FileText,
  ImageDown,
  FolderDown,
  Star,
  ListTodo,
  CalendarClock,
} from 'lucide-react';
import { FilterState, NoteTemplate, TEMPLATE_LABELS } from '@/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Menu, MenuItem, MenuLabel, MenuSeparator, Tooltip } from './ui/Menu';
import { NOTE_COLOR_CLASSES } from '@/lib/colors';
import { templateDefaultColor } from '@/lib/factories';

const TEMPLATE_ICONS: Record<NoteTemplate, typeof StickyNote> = {
  note: StickyNote,
  todo: CheckSquare,
  idea: Lightbulb,
  reminder: Bell,
};

interface ToolbarProps {
  connectMode: boolean;
  onToggleConnectMode: () => void;
  onAddNote: (template: NoteTemplate) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeFilter: FilterState['activeFilter'];
  onFilterChange: (filter: FilterState['activeFilter']) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onExportBoardJSON: () => void;
  onExportAllJSON: () => void;
  onExportMarkdown: () => void;
  onExportImage: () => void;
  onImport: (file: File) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const FILTER_OPTIONS: { value: FilterState['activeFilter']; label: string; icon: typeof Star }[] = [
  { value: 'all', label: 'All notes', icon: Filter },
  { value: 'tasks', label: 'With checklists', icon: ListTodo },
  { value: 'starred', label: 'Starred', icon: Star },
  { value: 'due', label: 'Overdue', icon: CalendarClock },
];

export function Toolbar({
  connectMode,
  onToggleConnectMode,
  onAddNote,
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onExportBoardJSON,
  onExportAllJSON,
  onExportMarkdown,
  onExportImage,
  onImport,
  darkMode,
  onToggleDarkMode,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white/90 p-1.5 shadow-panel backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/90">
      {/* Add note */}
      <Menu
        trigger={
          <Tooltip label="Add note">
            <Button variant="solid" size="sm">
              <Plus className="h-4 w-4" /> Note
            </Button>
          </Tooltip>
        }
      >
        <MenuLabel>New note</MenuLabel>
        {(Object.keys(TEMPLATE_LABELS) as NoteTemplate[]).map((tpl) => {
          const Icon = TEMPLATE_ICONS[tpl];
          const colorClasses = NOTE_COLOR_CLASSES[templateDefaultColor(tpl)];
          return (
            <MenuItem key={tpl} onClick={() => onAddNote(tpl)} icon={<Icon className="h-4 w-4" />}>
              <span className="flex-1">{TEMPLATE_LABELS[tpl]}</span>
              <span className={`h-3 w-3 rounded-full ${colorClasses.swatch}`} />
            </MenuItem>
          );
        })}
      </Menu>

      {/* Connect mode */}
      <Tooltip label={connectMode ? 'Click two notes to link them' : 'Link notes together'}>
        <Button variant="ghost" size="icon" active={connectMode} onClick={onToggleConnectMode}>
          <Link2 className="h-4 w-4" />
        </Button>
      </Tooltip>

      <div className="mx-0.5 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-40" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes & tags..."
          className="h-8 w-48 pl-8"
        />
      </div>

      {/* Filter */}
      <Menu
        trigger={
          <Tooltip label="Filter">
            <Button variant="ghost" size="icon" active={activeFilter !== 'all'}>
              <Filter className="h-4 w-4" />
            </Button>
          </Tooltip>
        }
      >
        <MenuLabel>Show</MenuLabel>
        {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => (
          <MenuItem
            key={value}
            onClick={() => onFilterChange(value)}
            icon={<Icon className="h-4 w-4" />}
            className={activeFilter === value ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>

      <div className="mx-0.5 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

      {/* Zoom */}
      <Tooltip label="Zoom out">
        <Button variant="ghost" size="icon" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
      </Tooltip>
      <button
        onClick={onZoomReset}
        className="w-12 rounded-lg text-center text-xs font-medium tabular-nums text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <Tooltip label="Zoom in">
        <Button variant="ghost" size="icon" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </Tooltip>

      <div className="mx-0.5 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

      {/* Export / Import */}
      <Menu
        align="right"
        trigger={
          <Tooltip label="Export / Import">
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </Tooltip>
        }
      >
        <MenuLabel>Export</MenuLabel>
        <MenuItem onClick={onExportBoardJSON} icon={<FileJson className="h-4 w-4" />}>
          This board (JSON)
        </MenuItem>
        <MenuItem onClick={onExportAllJSON} icon={<FolderDown className="h-4 w-4" />}>
          All boards (JSON)
        </MenuItem>
        <MenuItem onClick={onExportMarkdown} icon={<FileText className="h-4 w-4" />}>
          This board (Markdown)
        </MenuItem>
        <MenuItem onClick={onExportImage} icon={<ImageDown className="h-4 w-4" />}>
          This board (PNG image)
        </MenuItem>
        <MenuSeparator />
        <MenuLabel>Import</MenuLabel>
        <MenuItem onClick={() => fileInputRef.current?.click()} icon={<Upload className="h-4 w-4" />}>
          From JSON file...
        </MenuItem>
      </Menu>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = '';
        }}
      />

      {/* Dark mode */}
      <Tooltip label={darkMode ? 'Light mode' : 'Dark mode'}>
        <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </Tooltip>
    </div>
  );
}
