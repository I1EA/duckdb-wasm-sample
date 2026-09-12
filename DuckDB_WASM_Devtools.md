
# DuckDB WASM - Run in the Browser Devtools

```javascript

const duckdb = await import("https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@latest/+esm");

console.log(Object.keys(duckdb))

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

console.log(JSDELIVR_BUNDLES)

const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

console.log(bundle)

const worker_url = URL.createObjectURL(
  new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
);

const worker = new Worker(worker_url);

console.log(worker)

const t0 = performance.now();

const logger = new duckdb.ConsoleLogger();
const db = new duckdb.AsyncDuckDB(logger, worker);
await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

const t1 = performance.now();
console.log(`DuckDB instantiated in ${(t1 - t0).toFixed(0)}ms`);

const conn = await db.connect();

console.log("Connected to DuckDB");



```
