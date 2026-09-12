// Run with: node scripts/generate-sample-data.js
// Writes github_repos.csv and tech_jobs.csv into sample-data/

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "sample-data");
mkdirSync(OUT, { recursive: true });

// ── Deterministic pseudo-random (seeded) ────────────────────────────────────
function mulberry32(seed) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function pick(rng, arr) {
	return arr[Math.floor(rng() * arr.length)];
}

function randInt(rng, lo, hi) {
	return Math.floor(rng() * (hi - lo + 1)) + lo;
}

function csvRow(fields) {
	return fields
		.map((f) =>
			typeof f === "string" && (f.includes(",") || f.includes('"'))
				? `"${f.replace(/"/g, '""')}"`
				: f,
		)
		.join(",");
}

// ── 1. github_repos.csv ─────────────────────────────────────────────────────
const rng1 = mulberry32(42);

const repoData = [
	// [repo_name, language, topic, star_tier]  star_tier: 1=small 2=mid 3=large 4=huge
	["pandas-utils", "Python", "data", 2],
	["fastapi-boilerplate", "Python", "api", 3],
	["ml-pipeline-tools", "Python", "ml", 2],
	["pytorch-tutorials", "Python", "ml", 4],
	["django-rest-starter", "Python", "web", 2],
	["scrapy-spiders-collection", "Python", "data", 1],
	["jupyter-notebook-extensions", "Python", "data", 2],
	["python-algorithms-handbook", "Python", "cli", 4],
	["flask-microservices-template", "Python", "api", 2],
	["data-cleaning-toolkit", "Python", "data", 2],
	["sklearn-pipeline-utils", "Python", "ml", 3],
	["async-http-client-py", "Python", "api", 2],
	["python-design-patterns", "Python", "cli", 3],
	["crypto-price-analyzer", "Python", "data", 2],
	["langchain-examples", "Python", "ml", 3],
	["fastai-practical-notebooks", "Python", "ml", 3],
	["data-viz-templates", "Python", "data", 2],
	["pytest-advanced-fixtures", "Python", "devtools", 1],
	["image-processing-pipeline", "Python", "ml", 2],
	["openai-python-cookbook", "Python", "ml", 3],
	["rich-cli-dashboard", "Python", "cli", 2],
	["pdf-text-extractor", "Python", "data", 2],
	["time-series-toolkit", "Python", "data", 2],
	["db-migration-helper", "Python", "devtools", 1],
	["numpy-visual-guide", "Python", "data", 3],
	["api-rate-limiter-py", "Python", "api", 2],
	["docker-compose-generator", "Python", "cloud", 2],
	["security-vulnerability-scanner", "Python", "security", 2],
	["streamlit-dashboard-examples", "Python", "data", 3],
	["llm-fine-tuning-recipes", "Python", "ml", 3],
	["react-component-library", "JavaScript", "web", 3],
	["node-express-template", "JavaScript", "api", 2],
	["vanilla-js-30-projects", "JavaScript", "web", 4],
	["smooth-chart-animations", "JavaScript", "web", 2],
	["browser-storage-utils", "JavaScript", "web", 1],
	["2d-game-engine-js", "JavaScript", "game", 2],
	["websocket-server-utils", "JavaScript", "api", 2],
	["markdown-parser-zero-dep", "JavaScript", "devtools", 2],
	["color-palette-generator", "JavaScript", "devtools", 2],
	["css-animation-library", "JavaScript", "web", 3],
	["pdf-viewer-in-browser", "JavaScript", "web", 2],
	["lightweight-state-manager", "JavaScript", "web", 3],
	["api-mock-server-js", "JavaScript", "devtools", 2],
	["canvas-drawing-app", "JavaScript", "game", 1],
	["smart-notification-system", "JavaScript", "web", 2],
	["drag-and-drop-lib", "JavaScript", "web", 2],
	["date-utils-zero-deps", "JavaScript", "devtools", 3],
	["testing-helpers-jest", "JavaScript", "devtools", 2],
	["search-autocomplete-widget", "JavaScript", "web", 2],
	["headless-ui-kit-js", "JavaScript", "web", 3],
	["trpc-nextjs-starter", "TypeScript", "api", 3],
	["next-saas-boilerplate", "TypeScript", "web", 3],
	["prisma-seed-factory", "TypeScript", "data", 2],
	["nestjs-microservices-template", "TypeScript", "api", 2],
	["type-safe-api-client", "TypeScript", "api", 2],
	["react-custom-hooks-lib", "TypeScript", "web", 3],
	["zod-openapi-integration", "TypeScript", "devtools", 2],
	["typescript-algorithms", "TypeScript", "cli", 4],
	["graphql-codegen-plugins", "TypeScript", "api", 2],
	["monorepo-workspace-tools", "TypeScript", "devtools", 3],
	["ai-chat-interface", "TypeScript", "ml", 3],
	["electron-react-boilerplate", "TypeScript", "devtools", 3],
	["remix-fullstack-starters", "TypeScript", "web", 2],
	["accessible-data-table", "TypeScript", "web", 2],
	["cli-framework-ts", "TypeScript", "cli", 2],
	["mcp-server-sdk", "TypeScript", "api", 3],
	["browser-extension-boilerplate", "TypeScript", "devtools", 2],
	["go-rest-api-scaffold", "Go", "api", 2],
	["k8s-controller-template", "Go", "cloud", 2],
	["cli-task-manager-go", "Go", "cli", 2],
	["grpc-gateway-examples", "Go", "api", 3],
	["k8s-operator-boilerplate", "Go", "cloud", 2],
	["go-algorithms-patterns", "Go", "cli", 3],
	["distributed-key-value-store", "Go", "cloud", 2],
	["structured-log-aggregator", "Go", "devtools", 2],
	["web-scraper-go", "Go", "data", 2],
	["jwt-middleware-go", "Go", "security", 2],
	["rate-limiter-redis-go", "Go", "api", 2],
	["prometheus-custom-exporter", "Go", "cloud", 2],
	["wasm-game-engine-rs", "Rust", "game", 2],
	["tokio-async-runtime", "Rust", "api", 3],
	["clap-cli-framework", "Rust", "cli", 2],
	["rust-algorithms-book", "Rust", "cli", 4],
	["memory-safe-json-parser", "Rust", "devtools", 2],
	["embedded-hal-drivers", "Rust", "cli", 2],
	["async-network-protocol", "Rust", "api", 2],
	["sqlx-postgres-utils", "Rust", "data", 2],
	["gui-framework-egui-apps", "Rust", "web", 3],
	["serde-custom-formats", "Rust", "devtools", 3],
	["security-crypto-toolkit", "Rust", "security", 2],
	["ratatui-terminal-ui", "Rust", "cli", 2],
	["spring-cloud-microservices", "Java", "api", 3],
	["design-patterns-in-java", "Java", "cli", 4],
	["java-interview-handbook", "Java", "cli", 4],
	["android-clean-architecture", "Java", "mobile", 2],
	["jdbc-connection-pool", "Java", "data", 2],
	["kafka-stream-processing", "Java", "cloud", 2],
	["reactive-spring-webflux", "Java", "api", 2],
	["spring-security-examples", "Java", "security", 3],
	["android-firebase-template", "Java", "mobile", 2],
	["opengl-rendering-engine", "C++", "game", 2],
	["embedded-rtos-minimal", "C++", "cli", 2],
	["deep-learning-from-scratch", "C++", "ml", 3],
	["compression-algorithm-bench", "C++", "cli", 2],
	["embedded-database-engine", "C++", "data", 3],
	["robotics-motion-planning", "C++", "cli", 2],
	["vulkan-graphics-samples", "C++", "game", 2],
	["rails-starter-kit", "Ruby", "web", 3],
	["sidekiq-job-helpers", "Ruby", "api", 2],
	["ruby-algorithms-guide", "Ruby", "cli", 2],
	["devise-two-factor", "Ruby", "security", 2],
	["active-record-query-utils", "Ruby", "data", 2],
	["swiftui-component-gallery", "Swift", "mobile", 2],
	["ios-networking-layer", "Swift", "api", 2],
	["swift-algorithms-pack", "Swift", "cli", 3],
	["swiftui-charts-library", "Swift", "web", 2],
	["laravel-rest-api-starter", "PHP", "api", 3],
	["symfony-ddd-template", "PHP", "web", 2],
	["wordpress-gutenberg-blocks", "PHP", "web", 2],
];

const licenses = ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "None"];
const starBase = {
	1: [100, 4999],
	2: [5000, 24999],
	3: [25000, 79999],
	4: [80000, 200000],
};
const yearRange = [2018, 2026];

const repoHeaders =
	"repo_id,repo_name,owner_type,language,stars,forks,open_issues,watchers,size_kb,created_year,created_month,license,has_wiki,topic";
const repoRows = [repoHeaders];

repoData.forEach(([name, lang, topic, tier], i) => {
	const [lo, hi] = starBase[tier];
	const stars = randInt(rng1, lo, hi);
	const forks = Math.round(stars * (0.08 + rng1() * 0.12));
	const issues = Math.round(stars * (0.003 + rng1() * 0.007));
	const watchers = Math.round(stars * (0.9 + rng1() * 0.2));
	const size = randInt(rng1, 120, 85000);
	const year = randInt(rng1, yearRange[0], yearRange[1]);
	const month = randInt(rng1, 1, 12);
	const license = pick(rng1, licenses);
	const hasWiki = rng1() > 0.4 ? "true" : "false";
	const ownerType = rng1() > 0.35 ? "org" : "user";
	repoRows.push(
		csvRow([
			i + 1,
			name,
			ownerType,
			lang,
			stars,
			forks,
			issues,
			watchers,
			size,
			year,
			month,
			license,
			hasWiki,
			topic,
		]),
	);
});

writeFileSync(join(OUT, "github_repos.csv"), repoRows.join("\n"));
console.log(`✓ github_repos.csv  (${repoRows.length - 1} rows)`);

// ── 2. tech_jobs.csv ────────────────────────────────────────────────────────
const rng2 = mulberry32(99);

const jobTemplates = [
	["Software Engineer", ["Python", "Django", "PostgreSQL", "Docker"]],
	["Senior Software Engineer", ["TypeScript", "React", "Node.js", "AWS"]],
	["Staff Engineer", ["Go", "Kubernetes", "gRPC", "Terraform"]],
	["Principal Engineer", ["Rust", "C++", "LLVM", "Systems Programming"]],
	["Data Engineer", ["Python", "Spark", "Airflow", "dbt", "Snowflake"]],
	["Senior Data Engineer", ["Python", "Kafka", "Flink", "BigQuery", "dbt"]],
	["Data Scientist", ["Python", "scikit-learn", "PyTorch", "SQL", "Tableau"]],
	["Senior Data Scientist", ["Python", "TensorFlow", "MLflow", "Spark", "R"]],
	["ML Engineer", ["Python", "PyTorch", "CUDA", "Docker", "Kubernetes"]],
	["AI/ML Engineer", ["Python", "LangChain", "OpenAI API", "FastAPI", "Redis"]],
	["Frontend Engineer", ["TypeScript", "React", "Next.js", "CSS", "Vitest"]],
	[
		"Senior Frontend Engineer",
		["TypeScript", "React", "GraphQL", "Storybook", "Playwright"],
	],
	["Backend Engineer", ["Go", "PostgreSQL", "Redis", "gRPC", "Docker"]],
	[
		"Senior Backend Engineer",
		["Java", "Spring Boot", "Kafka", "Kubernetes", "AWS"],
	],
	[
		"Full Stack Engineer",
		["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
	],
	[
		"DevOps Engineer",
		["Terraform", "Kubernetes", "Ansible", "Python", "CI/CD"],
	],
	[
		"Platform Engineer",
		["Go", "Kubernetes", "Helm", "Prometheus", "Terraform"],
	],
	[
		"Security Engineer",
		["Python", "Go", "SAST", "Penetration Testing", "AWS IAM"],
	],
	[
		"Mobile Engineer (iOS)",
		["Swift", "SwiftUI", "Combine", "Core Data", "XCTest"],
	],
	[
		"Mobile Engineer (Android)",
		["Kotlin", "Jetpack Compose", "Coroutines", "Room", "Hilt"],
	],
	["Cloud Engineer", ["AWS", "Terraform", "Python", "Kubernetes", "CDK"]],
	[
		"Database Engineer",
		["PostgreSQL", "MySQL", "Redis", "Cassandra", "SQL tuning"],
	],
	[
		"Site Reliability Engineer",
		["Go", "Python", "Prometheus", "Grafana", "Kubernetes"],
	],
	[
		"Engineering Manager",
		["System Design", "Agile", "TypeScript", "Go", "Roadmapping"],
	],
	["Tech Lead", ["Python", "System Design", "AWS", "PostgreSQL", "Mentoring"]],
];

const companies = [
	["Stripe", "San Francisco", "USA"],
	["Vercel", "San Francisco", "USA"],
	["Cloudflare", "San Francisco", "USA"],
	["Figma", "San Francisco", "USA"],
	["Linear", "San Francisco", "USA"],
	["Notion", "San Francisco", "USA"],
	["Rippling", "San Francisco", "USA"],
	["Scale AI", "San Francisco", "USA"],
	["Airbnb", "San Francisco", "USA"],
	["Lyft", "San Francisco", "USA"],
	["HubSpot", "Boston", "USA"],
	["MongoDB", "New York", "USA"],
	["Datadog", "New York", "USA"],
	["DigitalOcean", "New York", "USA"],
	["Cockroach Labs", "New York", "USA"],
	["HashiCorp", "Austin", "USA"],
	["Grafana Labs", "Austin", "USA"],
	["Temporal", "Seattle", "USA"],
	["Amazon", "Seattle", "USA"],
	["Microsoft", "Seattle", "USA"],
	["Shopify", "Toronto", "Canada"],
	["1Password", "Toronto", "Canada"],
	["Wealthsimple", "Toronto", "Canada"],
	["Wise", "London", "UK"],
	["Monzo", "London", "UK"],
	["Revolut", "London", "UK"],
	["Deliveroo", "London", "UK"],
	["Zalando", "Berlin", "Germany"],
	["N26", "Berlin", "Germany"],
	["Contentful", "Berlin", "Germany"],
	["Booking.com", "Amsterdam", "Netherlands"],
	["Adyen", "Amsterdam", "Netherlands"],
	["Grab", "Singapore", "Singapore"],
	["GoTo", "Singapore", "Singapore"],
	["Razorpay", "Bangalore", "India"],
	["Swiggy", "Bangalore", "India"],
	["Zepto", "Mumbai", "India"],
	["Atlassian", "Sydney", "Australia"],
	["Canva", "Sydney", "Australia"],
];

const remoteOptions = ["yes", "no", "hybrid"];
const salaryBase = {
	"Software Engineer": [90000, 150000],
	"Senior Software Engineer": [130000, 200000],
	"Staff Engineer": [180000, 280000],
	"Principal Engineer": [220000, 350000],
	"Data Engineer": [100000, 165000],
	"Senior Data Engineer": [140000, 210000],
	"Data Scientist": [110000, 175000],
	"Senior Data Scientist": [150000, 230000],
	"ML Engineer": [130000, 200000],
	"AI/ML Engineer": [140000, 220000],
	"Frontend Engineer": [90000, 150000],
	"Senior Frontend Engineer": [125000, 190000],
	"Backend Engineer": [95000, 155000],
	"Senior Backend Engineer": [135000, 200000],
	"Full Stack Engineer": [100000, 160000],
	"DevOps Engineer": [110000, 175000],
	"Platform Engineer": [130000, 200000],
	"Security Engineer": [120000, 190000],
	"Mobile Engineer (iOS)": [110000, 175000],
	"Mobile Engineer (Android)": [105000, 170000],
	"Cloud Engineer": [115000, 180000],
	"Database Engineer": [110000, 175000],
	"Site Reliability Engineer": [130000, 200000],
	"Engineering Manager": [170000, 260000],
	"Tech Lead": [160000, 240000],
};

const jobHeaders =
	"job_id,title,company,city,country,remote,salary_usd_min,salary_usd_max,required_years,primary_skill,secondary_skills,posted_year,posted_month,applicants";
const jobRows = [jobHeaders];

for (let i = 0; i < 120; i++) {
	const [title, allSkills] = pick(rng2, jobTemplates);
	const [company, city, country] = pick(rng2, companies);
	const remote = pick(rng2, remoteOptions);
	const [loSal, hiSal] = salaryBase[title];
	const costMult =
		country === "USA"
			? 1.0
			: country === "Canada"
				? 0.82
				: country === "UK"
					? 0.88
					: country === "Germany" || country === "Netherlands"
						? 0.78
						: 0.55;
	const salMin =
		Math.round((randInt(rng2, loSal, hiSal - 20000) * costMult) / 1000) * 1000;
	const salMax =
		Math.round((salMin + randInt(rng2, 20000, 60000) * costMult) / 1000) * 1000;
	const reqYears = randInt(rng2, 1, 10);
	const primarySkill = allSkills[0];
	// pick 2-4 secondary skills (excluding primary)
	const secCount = randInt(rng2, 2, Math.min(4, allSkills.length - 1));
	const secondary = allSkills.slice(1, secCount + 1).join(";");
	const postedYear = randInt(rng2, 2023, 2026);
	const postedMonth = randInt(rng2, 1, 12);
	const applicants = randInt(rng2, 12, 980);
	jobRows.push(
		csvRow([
			i + 1,
			title,
			company,
			city,
			country,
			remote,
			salMin,
			salMax,
			reqYears,
			primarySkill,
			secondary,
			postedYear,
			postedMonth,
			applicants,
		]),
	);
}

writeFileSync(join(OUT, "tech_jobs.csv"), jobRows.join("\n"));
console.log(`✓ tech_jobs.csv     (${jobRows.length - 1} rows)`);
