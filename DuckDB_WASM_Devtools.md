
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

const t2 = performance.now();
// run a conn.query with generate_series to generate a series of numbers
const result = await conn.query("SELECT * FROM generate_series(1, 10, 1);"); // generate a series of numbers from 1 to 10 with step 1
const t3 = performance.now();

console.log(`First query executed in ${(t3 - t2).toFixed(0)}ms`);

console.log(result.toArray().map(row => row.toJSON()));


const t4 = performance.now();
const result2 = await conn.query("SELECT * FROM generate_series(1, 10000000, 5);"); // generate a series of numbers from 1 to 10000000 with step 5
const t5 = performance.now();
console.log(`Second query executed in ${(t5 - t4).toFixed(0)}ms`);

console.log(result2.toArray().map(row => row.toJSON()));

await conn.close();
console.log("Connection closed");
await db.terminate();
console.log("Database terminated");
worker.terminate();
console.log("Worker terminated");

```
