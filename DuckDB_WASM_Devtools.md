# DuckDB WASM in the Browser Devtools

DuckDB compiles to WebAssembly and runs as a full SQL database in a browser tab. This procedure starts the database from the Devtools console. No installation and no server are necessary.

The script downloads the WASM bundle from a CDN, starts a Web Worker, runs two queries, and stops the database.

## Before you start

Run the script on [https://color-conjure.netlify.app](https://color-conjure.netlify.app/). This page permits script imports from the CDN. Many pages have a Content-Security-Policy that blocks the import.

Do not use an `about:blank` page or a `file://` page. These pages have an opaque origin, and the Web Worker does not start.

## Procedure

1. Open [https://color-conjure.netlify.app](https://color-conjure.netlify.app/) in Chrome or Edge.
2. Open the Devtools. Push `Cmd + Option + I` (macOS) or `F12` (Windows or Linux).
3. Select the **Console** tab.
4. Type `allow pasting` and push Enter. Chrome requires this one time for each profile.
5. Paste the full script. Push Enter.

The script uses top-level `await`, and each step uses the variables from the step before. Therefore, run the full script one time. Do not run the lines one by one.

## Script

```javascript
// 1. Import the DuckDB client library from the CDN.
//    `+esm` is a jsDelivr option that gives the package as an ES module.
//    Replace `@latest` with a version number for production code. `@latest` can change.
const duckdb = await import("https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@latest/+esm");

// Result: an array of 36 names. It contains AsyncDuckDB, ConsoleLogger, getJsDelivrBundles, and selectBundle.
// A CSP error at this line shows that the page blocked the import.
console.log(Object.keys(duckdb))

// 2. Get the list of prebuilt WASM bundles on jsDelivr.
//    DuckDB supplies more than one build, because browsers support different WASM features.
const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

// Result: two entries, `mvp` and `eh`. Each entry has a .wasm module and a worker script.
//   mvp = the minimum feature set.
//   eh  = the build with WASM exception handling. It is faster and needs a recent browser.
console.log(JSDELIVR_BUNDLES)

// 3. Find the WASM features of this browser and select the applicable bundle.
const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

// Result: the `eh` bundle on a recent browser, and `pthreadWorker: null`.
// A null pthreadWorker is correct. DuckDB selects the multi-thread build only on a cross-origin isolated page,
// that is, a page with COOP and COEP headers. Other pages get the single-thread build.
console.log(bundle)

// 4. Start the worker.
//    A Worker must have the same origin as the page, but the bundle is on a CDN.
//    Thus `new Worker(bundle.mainWorker)` is not possible. Make a small same-origin blob
//    script instead. The blob script calls importScripts() on the CDN worker.
const worker_url = URL.createObjectURL(
  new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
);

const worker = new Worker(worker_url);

// Result: a Worker object from a blob URL, for example
// `blob:https://color-conjure.netlify.app/6c684d6c-3003-...`.
// A SecurityError shows that the page has an opaque origin.
console.log(worker)

// 5. Start the database. This step downloads and compiles the .wasm binary.
//    It is the slowest step. All subsequent steps are fast.
const t0 = performance.now();

// ConsoleLogger writes the internal DuckDB log events to the console.
// Use `new duckdb.VoidLogger()` to stop these messages.
const logger = new duckdb.ConsoleLogger();
const db = new duckdb.AsyncDuckDB(logger, worker);
await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

const t1 = performance.now();
// Result: approximately 1200 ms with a warm cache. The first run takes longer.
// Look at the Network tab to monitor the duckdb-eh.wasm download.
console.log(`DuckDB instantiated in ${(t1 - t0).toFixed(0)}ms`);

// 6. Open a connection. More than one connection to the same `db` is possible.
const conn = await db.connect();

console.log("Connected to DuckDB");

// 7. Run the first query.
//    ConsoleLogger now writes one more line for each query, for example:
//    { timestamp: ..., level: 2, origin: 4, topic: 4, event: 4, value: 'SELECT ...' }
//    The numbers are enumerations: level 2 = INFO, origin 4 = DUCKDB, topic 4 = QUERY,
//    event 4 = RUN. Use duckdb.getLogLevelLabel(2) to decode a number.
const t2 = performance.now();
const result = await conn.query("SELECT * FROM generate_series(1, 10, 1);"); // 1 to 10, step 1
const t3 = performance.now();

// Result: approximately 29 ms. The first query also does some single-time DuckDB setup.
console.log(`First query executed in ${(t3 - t2).toFixed(0)}ms`);

// `result` is an Apache Arrow Table. It is not a JavaScript array. Use these properties:
//   result.numRows                      -> 10
//   result.schema.fields                -> one field, `generate_series`, of type Int64
//   result.toArray()                    -> Arrow Row objects
// `.toArray().map(row => row.toJSON())` changes the Rows into standard JavaScript objects.
//
// Result: 10 objects with BigInt values, because generate_series gives BIGINT.
// The console shows an `n` after each value: {generate_series: 1n} ... {generate_series: 10n}
// JSON.stringify() on a BigInt causes a TypeError. Use Number(row.generate_series) first.
console.log(result.toArray().map(row => row.toJSON()));


// 8. Run the second query. It gives 2,000,000 rows.
const t4 = performance.now();
const result2 = await conn.query("SELECT * FROM generate_series(1, 10000000, 5);"); // 1 to 10000000, step 5
const t5 = performance.now();
// Result: approximately 39 ms for 2,000,000 rows, the same order as the 10-row query.
// DuckDB does this work in WASM, in the worker, and not on the main thread.
console.log(`Second query executed in ${(t5 - t4).toFixed(0)}ms`);

// CAUTION: The next line changes 2,000,000 Arrow rows into JavaScript objects and writes
// them to the console. The conversion takes approximately 558 ms, more than ten times the
// query time. The console output makes the tab slow.
// Use `result2.numRows` or `result2.toArray().slice(0, 5)` for a demonstration.
// The data crosses from WASM to JavaScript at this line, and that transfer is the cost.
console.log(result2.toArray().map(row => row.toJSON()));

// 9. Stop the database in this sequence: connection, then database, then worker.
//    A worker and its WASM memory stay in the tab if you do not do this step.
await conn.close();
console.log("Connection closed");
await db.terminate();
console.log("Database terminated");
worker.terminate();
console.log("Worker terminated");

// `conn` is not usable after this point. Reload the page to run the script again.
```

## Faults and corrections

| Fault | Cause | Correction |
| --- | --- | --- |
| `Refused to load the script 'https://cdn.jsdelivr.net/...'` | The CSP of the page blocks the CDN | Use [https://color-conjure.netlify.app](https://color-conjure.netlify.app/) |
| `SecurityError` at `new Worker(...)` | The page has an opaque origin | Do not use `about:blank` or `file://` |
| `Identifier 'duckdb' has already been declared` | You pasted the script two times | Reload the page. Paste one time |
| The console does not accept the paste | Chrome paste protection | Type `allow pasting`. Push Enter |
| `await is only valid in async functions` | The context does not permit top-level await | Use the Devtools console |
| `Do not know how to serialize a BigInt` | `JSON.stringify` on a BIGINT column | Use `Number(row.generate_series)` |
| The tab becomes slow | The console shows 2,000,000 objects | Use `result2.numRows` |

## Related

- [DuckDB WASM documentation](https://duckdb.org/docs/lts/clients/wasm/overview)
- [DuckDBShell.md](DuckDBShell.md) - the same engine in the hosted DuckDB shell
