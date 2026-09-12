import { Dropzone } from "./components/Dropzone";

function App() {
  return (
    <div>
      <div className="layout">
        <header className="header">
          <div className="header-brand">
            <span className="header-logo">◆</span>
            <span className="header-title">DataDrop</span>
          </div>
          <span className="header-tagline">In-browser SQL analytics - powered by DuckDB-WASM</span>
        </header>

        <main className="content">
          {/* // TODO: Implement loadCSV function and manage DuckDB readiness state */}
          <Dropzone />
        </main>
      </div>
    </div>
  );
}

export default App;
