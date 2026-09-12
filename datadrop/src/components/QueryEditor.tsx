import type { KeyboardEvent } from "react";

interface Props {
  sql: string;
  onChange: (sql: string) => void;
  onRun: () => void;
  isRunning: boolean;
  disabled: boolean;
}

export function QueryEditor({ sql, onChange, onRun, isRunning, disabled }: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
    }
  };

  return (
    <div className="editor">
      <div className="editor-header">
        <span className="editor-label">SQL Query</span>
      </div>
      <textarea
        className="editor-textarea"
        value={sql}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={6}
        spellCheck={false}
        placeholder="SELECT * FROM your_table LIMIT 100"
        disabled={disabled}
      />
      <div className="editor-footer">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onRun}
          disabled={disabled || isRunning || !sql.trim()}
        >
          {isRunning ? "Running…" : "Run"}
        </button>
        <span className="editor-shortcut">⌘↵ | Ctrl+↵</span>
      </div>
    </div>
  );
}
