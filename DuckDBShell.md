# NL Railway Dataset

Dutch railway service and stop data for March 2025, queried with SQL in the browser.

## Getting Started

**Q: What is [DUCKDB Shell](https://shell.duckdb.org/) ?**

A: An in-browser SQL shell that runs DuckDB compiled to WebAssembly. No install or server needed.

**Q: Where does this dataset come from, and how do you load it into the shell?**

A:

```sql
CREATE TABLE services AS
FROM 'https://blobs.duckdb.org/nl-railway/services-2025-03.csv.gz';
```

**Q: What columns does this table have, and what type is each one?**

A:

```sql
DESCRIBE services;
```

**Q: What do the columns look like at a glance, min, max, how many nulls?**

A:

```sql
SUMMARIZE services;
```

## Understanding the Data

**Q: What time period does this data cover, and how many actual trains are in it?**

A:

```sql
SELECT MIN("Service:Date"), MAX("Service:Date"), COUNT(DISTINCT "Service:RDT-ID") AS distinct_trains
FROM services;
```

**Q: Why doesn't COUNT(*) give the number of trains?**

A: `COUNT(*)` counts stops (rows). One train stops at many stations, so it shows up as many rows. `COUNT(DISTINCT "Service:RDT-ID")` counts unique trains instead.

**Q: Can COUNT(DISTINCT "Service:RDT-ID") be run on its own, without SELECT or FROM?**

A: No, it needs both:

```sql
SELECT COUNT(DISTINCT "Service:RDT-ID") FROM services;
```

## Delays

**Q: Which train companies have the worst average delays?**

A:

```sql
SELECT "Service:Company",
       COUNT(DISTINCT "Service:RDT-ID") AS trains,
       ROUND(AVG("Service:Maximum delay"), 1) AS avg_max_delay_min,
       MAX("Service:Maximum delay") AS worst_delay_min
FROM services
GROUP BY 1 ORDER BY avg_max_delay_min DESC;
```

**Q: In that query, what does GROUP BY 1 mean?**

A: It groups rows by the first column in the SELECT list. Here that is "Service:Company".

**Q: What does ORDER BY avg_max_delay_min DESC do?**

A: Sorts the results by that column, highest value first.

**Q: What does ROUND do?**

A: Rounds a number to a given number of decimal places. ROUND(2.4848, 1) gives 2.5.

**Q: What percentage of departures run more than 5 minutes late?**

A:

```sql
SELECT ROUND(100.0 * SUM(("Stop:Departure delay" > 5)::INT) / COUNT(*), 2) AS pct_late
FROM services WHERE "Stop:Departure delay" IS NOT NULL;
```

**Q: Which 10 days had the worst average delays?**

A:

```sql
SELECT "Service:Date" AS d, ROUND(AVG("Service:Maximum delay"), 1) AS avg_delay,
       RANK() OVER (ORDER BY AVG("Service:Maximum delay") DESC) AS rnk
FROM services GROUP BY 1
QUALIFY rnk <= 10;
```

**Q: How do delays differ between everyday trains and international or night trains, like Nightjet?**

A:

```sql
SELECT "Service:Type", COUNT(DISTINCT "Service:RDT-ID") AS trains,
       ROUND(AVG("Service:Maximum delay"), 1) AS avg_delay
FROM services GROUP BY 1 ORDER BY trains DESC;
```

**Q: Are some days of the week worse for delays than others?**

A:

```sql
SELECT strftime("Service:Date", '%A') AS weekday,
       COUNT(*) AS n, ROUND(AVG("Service:Maximum delay"), 1) AS avg_delay
FROM services GROUP BY 1 ORDER BY avg_delay DESC;
```

## Cancellations and Stations

**Q: Which companies cancel the most trains?**

A:

```sql
SELECT "Service:Company",
       SUM("Service:Completely cancelled"::INT) AS fully_cancelled,
       SUM("Service:Partly cancelled"::INT) AS partly_cancelled
FROM services GROUP BY 1 ORDER BY 2 DESC;
```

**Q: Which stations are the busiest?**

A:

```sql
SELECT "Stop:Station name", COUNT(*) AS stop_events
FROM services GROUP BY 1 ORDER BY 2 DESC LIMIT 15;
```

## Performance and Output

**Q: How long did that query take to run?**

A:

```sql
.timer on
```

**Q: How do you stop long text columns from getting cut off in the output?**

A:

```sql
.maxwidth 100000
```

**Q: How does an approximate distinct count compare to an exact one?**

A: COUNT(DISTINCT ...) gives an exact count. approx_count_distinct(...) uses HyperLogLog for a faster but approximate count, which can be off by 10% or more.

```sql
SELECT approx_count_distinct("Service:RDT-ID") FROM services;
```

**Q: How do you save query results to a file?**

A:

```sql
COPY (SELECT * FROM services WHERE "Service:Company" = 'NS Int') TO 'nightjet.parquet' (FORMAT parquet);
```
