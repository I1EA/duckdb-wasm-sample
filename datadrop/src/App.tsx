import { Dropzone } from "./components/Dropzone";
import { QueryEditor } from "./components/QueryEditor";
import { TableList } from "./components/TableList";

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
          <Dropzone onFile={(files) => console.log(files)} />

          {/* // TODO: Replace empty tables array with actual loaded tables from DuckDB hook */}
          <TableList tables={[]} onSelect={(name) => console.log(name)} />

          {/* // TODO: Implement query execution and manage query state */}
          <QueryEditor
            sql=""
            onChange={(sql) => console.log(sql)}
            onRun={() => console.log("Run query")}
            isRunning={false}
            disabled={false}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
