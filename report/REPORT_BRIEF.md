# Tracer Project — Complete Report-Writing Brief (Chapters 1–5)

**Paste this whole file into a Claude chat to write the report.** It contains every
verified fact, real reference, and chapter blueprint needed. Rules for whoever writes:
(1) never invent a citation — only the verified references below are usable, add new
ones only from a real web search; (2) never invent implementation details — everything
true about the system is in the Project Facts section; (3) write original academic prose.

---

## 0. SETUP / PRELIMINARY PAGES

- **Registered title:** "Machine Learning-Based Financial Fraud Detection System"
  (final system was rebuilt on Bitcoin data; keep the registered title on the cover,
  explain the scope in Ch 1 & 3).
- **Level:** BSc Computer Science final year project.
- **University/Department:** Crescent University, Abeokuta — Department of Computer Science.
- **Citation style:** APA (author–date).
- **Chapter structure:** standard Nigerian CS 5-chapter.
- **Formatting defaults:** A4; Times New Roman 12pt; double line spacing; margins 1.5" left,
  1" top/right/bottom; roman-numeral prelims, arabic from Chapter 1.
- **Prelim pages needed:** Title, Certification, Dedication, Acknowledgement, Abstract,
  Table of Contents, List of Figures, List of Tables.
- **PLACEHOLDERS the student must fill:** matric number; supervisor name + title;
  HOD name; submission month/year; dedication & acknowledgement text.

---

## 1. VERIFIED REFERENCES (APA) — the only citations that may be used as-is

1. Chainalysis. (2026). *2026 Crypto Crime Report — Introduction.* https://www.chainalysis.com/blog/2026-crypto-crime-report-introduction/
   — Illicit crypto addresses received ≥ $154 billion in 2025 (record; sanctioned-entity driven; still <1% of attributed volume).
2. Hamilton, W. L., Ying, R., & Leskovec, J. (2017). Inductive representation learning on large graphs. *NeurIPS 2017.*
   — The GraphSAGE method: sample-and-aggregate neighbourhood embeddings; generalises to unseen nodes (inductive).
3. Lopez-Rojas, E. A., Elmir, A., & Axelsson, S. (2016). PaySim: A financial mobile money simulator for fraud detection. *28th European Modeling and Simulation Symposium (EMSS 2016)*, Larnaca, Cyprus.
   — Synthetic mobile-money data from aggregated real logs; 744 hourly steps ≈ 1 month; types CASH-IN/CASH-OUT/DEBIT/PAYMENT/TRANSFER.
4. United Nations Office on Drugs and Crime. (2011). *Estimating illicit financial flows…* https://www.unodc.org/unodc/en/money-laundering/overview.html
   — 2–5% of global GDP (~$800bn–$2tn) laundered annually.
5. Weber, M., Domeniconi, G., Chen, J., Weidele, D. K. I., Bellei, C., Robinson, T., & Leiserson, C. E. (2019). Anti-money laundering in Bitcoin: Experimenting with graph convolutional networks for financial forensics. *arXiv:1908.02591.*
   — Introduces the Elliptic dataset (>200K tx nodes, 234K edges, 166 features); benchmarks Logistic Regression, Random Forest, MLP, GCN; RF illicit F1 ≈ 0.79; notes a dark-market shutdown degrading later-period performance.
6. Chawla, N. V., Bowyer, K. W., Hall, L. O., & Kegelmeyer, W. P. (2002). SMOTE: Synthetic minority over-sampling technique. *Journal of Artificial Intelligence Research, 16*, 321–357.
   — The SMOTE method: over-sample the minority class by generating synthetic examples in feature space; improves classifier performance on imbalanced data.

**Still to find (do a real web search when writing Ch 2 — do NOT fabricate):**
- Breiman, L. (2001), *Random Forests*, Machine Learning 45(1), 5–32. (foundational RF citation)
- A recent (2023–2025) GNN-for-financial-fraud survey or study.
- 2–3 more "related works" applying ML/GNN to fraud or AML, each with a stated method + finding + limitation.
- (Optional) A Chainalysis or FATF source on crypto-crime typologies if a stronger AML-context cite is wanted.

---

## 2. PROJECT FACTS (ground truth — the system actually exists and was tested)

### 2.1 The two iterations
- **Iteration 1 (PaySim):** synthetic mobile-money data, ~6.3M transactions, 0.13% fraud.
  Built the initial pipeline: drop identifier/flag columns, one-hot encode `type`, 80/20
  stratified split, SMOTE on train, StandardScaler, Random Forest. Reached ~99.9% accuracy /
  95% recall but on synthetic single-transaction data with no real graph — motivating the pivot.
- **Iteration 2 (Elliptic):** real Bitcoin transaction graph; enabled genuine graph analysis.
  This is the final system. Supervisor approved the dataset change.

### 2.2 Elliptic dataset (final system)
- 203,769 transaction nodes; 234,355 directed payment-flow edges; 49 time steps (~2 weeks each).
- 166 features per node (feature 1 = time step; the rest anonymised). Elliptic documents that
  the first ~94 are **local** (the transaction itself) and the remainder are **aggregated**
  from the one-hop neighbourhood.
- Labels: 2.2% illicit, 20.6% licit, 77.1% unknown. Modelling uses only the 46,564 labelled nodes.
- **Nodes are transactions, not accounts** (Bitcoin's model: transactions spend prior transactions' outputs).

### 2.3 Methodology / ML pipeline
- **Temporal split:** train on time steps 1–34, test on 35–49 (evaluate on the future; avoids
  data leakage; matches Weber et al.). Train ≈ 29,894 labelled (3,462 illicit); test ≈ 16,670 (1,083 illicit).
- SMOTE applied to the training partition only; StandardScaler on features.
- **Random Forest:** 200 trees, class_weight balanced, scikit-learn.
- **GraphSAGE (GNN):** 2 SAGEConv layers (hidden 128) + linear head, PyTorch Geometric, 2-hop reach.
- **Combined variant:** RF trained on features augmented with GNN node embeddings.

### 2.4 RESULTS (held-out temporal test set; illicit = positive class)
| Model | Accuracy | Precision | Recall | F1 (illicit) | AUC-ROC |
|---|---|---|---|---|---|
| Random Forest | 97.8% | 92.5% | 71.6% | **0.807** | 0.944 |
| GraphSAGE (GNN) | 96.7% | 84.7% | 59.3% | 0.697 | 0.897 |
| RF + GNN embeddings | 96.8% | 87.4% | 59.4% | 0.707 | 0.868 |

- RF F1 0.807 **reproduces the published benchmark** (Weber et al. ≈0.79).
- **Confusion matrix, RF @ 0.5:** TP 776, FP 65, FN 307, TN 15,522.
- **Confusion matrix, GNN @ 0.5:** TP 642, FP 116, FN 441, TN 15,471.
- **Global RF feature importance:** local features ≈ 76.5% of decision weight, neighbourhood-aggregate ≈ 23.5%.
- **Interpretation notes for discussion:** RF wins because Elliptic's features already encode
  neighbourhood aggregates (so the RF indirectly gets graph signal); the GNN demonstrates
  true graph-native learning; the recall shortfall (~28% of illicit missed) is partly due to a
  **dark-market shutdown around step 43** inside the test window — a real case of **concept drift**.

### 2.5 System architecture (3-tier) — the "Tracer" console
- **Presentation:** React + Vite + Tailwind. Light/dark theme, landing page, login. Analyst pages:
  Overview, Live Monitor, Analyze Transaction (with 2-hop network graph + "Why this score" XAI panel),
  Alerts, Reports. Admin pages: Model Health (ROC curves, confusion matrices, feature-importance charts,
  model comparison table), User Accounts.
- **Application:** Flask REST API, JWT auth, role-based access (analyst / admin). Blueprints:
  auth, transactions, predictions, monitor, reports, admin.
- **Data:** MySQL (database `elliptic_fraud`) + serialised model artifacts
  (`elliptic_rf.pkl`, `elliptic_gnn.pt`, `elliptic_serving.npz`, scaler).

### 2.6 Database schema (MySQL tables — real)
- **user**(user_id PK, username, email, password_hash, role[analyst|admin], created_at)
- **transaction**(tx_id PK, time_step, label[illicit|licit|unknown])
- **edge**(id PK, source_tx, target_tx)  — the payment-flow graph
- **prediction**(prediction_id PK, transaction_id FK→transaction, user_id FK→user, model_type, predicted_class, fraud_probability, prediction_timestamp)
- **alert**(alert_id PK, prediction_id FK→prediction, alert_status[open|resolved], assigned_to FK→user, resolved_at, notes)
- **report**(report_id PK, generated_by FK→user, report_type, date_range_start, date_range_end, generated_at, file_path)
- **model_metrics**(metric_id PK, model_version, model_type, accuracy, precision, recall, f1_score, auc_roc, evaluated_at)
- **monitor_state**(id PK, last_step, updated_at)  — replay position

### 2.7 Key features (all built and verified)
- **Analyze Transaction:** analyst browses/searches real transactions, scores one by lookup with
  RF or GNN (toggle), sees a risk-spectrum readout, both model scores, ground-truth label, a
  **2-hop network graph** (node coloured by risk/label), and a **"Why this score"** explainability panel.
- **Live Monitor:** replays test-period steps 35–49 as a live stream; every transaction in each step
  is screened automatically; high-confidence crossings raise alerts (per-model thresholds RF≥0.9,
  GNN≥0.99; top-25 "alert budget" per step modelling analyst capacity). Play/pause, step-advance, reset.
  This is what makes the system *monitor*, not just *detect*.
- **Alerts:** auto-created on flagged transactions; analyst adds notes and resolves.
- **Reports:** CSV export of predictions/alerts over a date range.
- **Admin Model Health:** ROC curves, confusion matrices, feature-importance charts, 3-model comparison.
- **Explainability (XAI):** per-transaction feature contributions via **decision-path attribution
  (the Saabas method, precursor of TreeSHAP)** — implemented natively in numpy because SHAP's numba
  dependency is blocked by Windows Application Control. Contributions sum exactly to the model output
  (additivity, asserted by a test). Reported as local-vs-network group split since features are anonymised.

### 2.8 Testing
- **29 automated pytest tests, all passing.** Coverage: login success/failure, JWT-protected routes,
  role enforcement (analyst blocked from admin routes), input validation (400/404 paths), a regression
  test that the open registration endpoint was removed, model inference determinism, known illicit
  flagged / known licit cleared, batch step-screening, threshold monotonicity, and XAI additivity.
- Run with an in-memory SQLite fixture, isolated from the live DB.

### 2.9 Security posture (local demo scope — state honestly)
- No open registration (removed; accounts seeded via script or admin-only API — this closed a real
  hole found during a QA pass where anyone could create an admin).
- JWT identity stored as string (fixes a real flask-jwt-extended/PyJWT compatibility bug encountered).
- Passwords hashed with bcrypt. Roles enforced server-side.
- CORS open and Flask debug on — acceptable for local development, flagged as not production-ready.

### 2.10 Tech stack (exact)
Python 3.11, scikit-learn, imbalanced-learn (SMOTE), pandas, NumPy, joblib, PyTorch (CPU),
PyTorch Geometric; Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt, Flask-CORS, PyMySQL;
React 18, Vite, Tailwind CSS, React Router; MySQL (via XAMPP). Git/GitHub for version control; pytest for testing.

---

## 3. CHAPTER BLUEPRINTS

### CHAPTER 1 — INTRODUCTION  (write ~8–12 pages)
- **1.1 Background of the Study** — money laundering scale (UNODC: 2–5% of global GDP,
  ~$800bn–$2tn/yr); crypto raises the stakes (Chainalysis: ≥$154bn illicit in 2025) but the
  public blockchain also exposes the full transaction graph for analysis; ML replaced brittle
  rule systems; graph neural networks extend ML to the network because laundering is a *network*
  crime (Weber et al., 2019); note the two iterations (PaySim → Elliptic) and name the system **Tracer**.
- **1.2 Statement of the Problem** — transaction volume defeats manual review; rule systems give
  false alarms and are evaded; most ML treats transactions in isolation and so misses the network
  structure that defines laundering. Need: learns from data, uses the network, runs automatically
  at stream scale, and explains its decisions.
- **1.3 Aim and Objectives** — **HARD CHECKPOINT, get supervisor sign-off.**
  Aim: design and implement an ML-based financial fraud detection system that identifies illicit
  transactions in a real transaction network and supports analysts with automated screening,
  alerting, and explainable results. The 5 objectives (write each as a statement + 1–2 sentences
  on what it involves/produces):
  (1) review existing fraud-detection approaches — rules, classical ML, graph methods;
  (2) acquire and prepare the datasets — PaySim then Elliptic; feature encoding, SMOTE, temporal split;
  (3) develop two complementary models — Random Forest (features) and GraphSAGE (graph) — and compare them;
  (4) design and implement a three-tier web application integrating the models into an analyst workflow;
  (5) evaluate the models and system — metrics vs the published benchmark + an automated test suite.
- **1.4 Significance of the Study** — demonstrates the production AML architecture (ML + graph +
  human review) at academic scale; empirical RF-vs-GNN comparison reproducing a published benchmark;
  explainability aids compliance adoption; documents an iterative synthetic→real methodology.
- **1.5 Scope of the Study** — covers both dataset iterations, the three models, and the full Tracer
  app (two roles; browse/score; 2-hop graph view; live monitoring + auto-alerts; explanations; case
  management; reporting; model dashboards). Excludes: live blockchain feed (monitoring replays the
  dataset timeline), identity resolution, production deployment, fraud types outside the datasets.
- **1.6 Limitations of the Study** — anonymised Elliptic features limit per-feature interpretability
  (explain by feature groups instead); only 23% of nodes are labelled; a dark-market shutdown in the
  test window causes concept drift and depresses recall; results are Bitcoin-specific.
- **1.7 Definition of Terms** — blockchain, Bitcoin, money laundering, machine learning, Random Forest,
  graph neural network, GraphSAGE, SMOTE, temporal split, precision, recall, F1-score, AUC-ROC, XAI.

  *(All the numbers and the citation points above are in Section 2 "Project Facts" and Section 1
  "Verified References" — use them; do not invent figures.)*

### CHAPTER 2 — LITERATURE REVIEW  (write ~10–15 pages)
- **2.1 Preamble** — what the chapter covers.
- **2.2 Conceptual review:** financial fraud & money laundering; the layering/placement/integration
  model; why AML is a *network* problem; cryptocurrency and blockchain transparency vs pseudonymity.
- **2.3 Fraud detection approaches:** (a) rule-based systems — strengths, false-alarm/evasion weaknesses;
  (b) classical supervised ML — Random Forest, class imbalance, SMOTE; (c) graph-based methods and GNNs —
  GraphSAGE, GCN, message passing.
- **2.4 Review of Related Works:** 6–10 studies, each: approach → what it found → limitation/gap.
  Anchor with Weber et al. (2019) on Elliptic. **Find the rest via real web search** (recent GNN-fraud
  papers, SMOTE original, Random Forest original, any AML-ML study). Every entry must be a real source.
- **2.5 Summary / research gap:** most ML fraud work treats transactions in isolation; graph structure
  is under-used in student implementations; explainability and continuous monitoring are often missing.
  Tracer addresses all three.
- Cite the 5 verified references above wherever relevant; add newly-found ones to the reference list.

### CHAPTER 3 — SYSTEM ANALYSIS AND DESIGN  (write ~12–18 pages)
- **3.1 Preamble.**
- **3.2 Analysis of the existing system:** manual/rule-based AML review; its limitations (volume,
  false alarms, no network view). Cite where possible.
- **3.3 Analysis of the proposed system:** what Tracer does and how it improves on the above.
- **3.4 Methodology:** iterative/experimental methodology; document **both iterations** (PaySim →
  Elliptic and why); the ML pipeline (preprocessing, SMOTE, temporal split, RF, GraphSAGE, combined);
  the temporal-split rationale (avoids leakage).
- **3.5 System requirements:** functional (per role) and non-functional; hardware/software.
- **3.6 System design (with diagrams — see section 4 below):** architecture diagram; use-case diagram
  (analyst & admin); ERD (the 8 tables); data-flow / sequence for the fraud-scoring and monitoring flows.
- **3.7 Database design:** table-by-table schema (use section 2.6), keys, relationships.
- **3.8 Model design:** RF and GraphSAGE architectures, features, thresholds, the alert-budget logic.
- **3.9 Interface design:** page inventory and roles (section 2.5/2.7).

### CHAPTER 4 — IMPLEMENTATION AND TESTING  (write ~12–18 pages; system IS built — screenshots exist)
- **4.1 Preamble.**
- **4.2 Implementation environment / tools:** exact stack (section 2.10).
- **4.3 Module/feature implementation:** walk through each — auth & roles; transaction browse/search;
  scoring service (RF live + precomputed GNN); the 2-hop subgraph endpoint & visualisation; Live Monitor
  replay + auto-alerts; alerts & resolution; reports; admin model-health charts; the XAI panel.
  For each, describe what it does and how the tiers cooperate. **Insert screenshots** of: landing page,
  login, analyst overview, Analyze page with network graph + Why-this-score, Live Monitor mid-run,
  Alerts, Admin Model Health (ROC/confusion/importance). (Student to capture from the running app —
  `start.bat`, log in analyst/analyst123 or admin/admin123.)
- **4.4 Model training & results:** the results table (2.4), confusion matrices (2.4), ROC/AUC,
  feature-importance split, reproduction of the Weber benchmark; discuss RF-vs-GNN and the concept-drift
  recall dip.
- **4.5 System testing:** the 29 pytest tests (2.8) — what categories, that all pass; mention functional
  walkthrough. A short table of representative test cases (input → expected → actual → pass) reads well.
- **4.6 Discussion:** what worked, the honest limitations (anonymised features, unlabeled majority,
  concept drift, local-only monitoring).

### CHAPTER 5 — SUMMARY, CONCLUSION AND RECOMMENDATIONS  (write ~5–8 pages)
- **5.1 Summary of the study:** restate problem, approach, and what was built.
- **5.2 Achievement of objectives:** take the 5 objectives from Ch 1 and show, one by one, how each
  was met (review done; datasets prepared; two models built & compared; three-tier app implemented;
  evaluation + tests completed against the benchmark).
- **5.3 Conclusion:** the system demonstrates, at academic scale, the ML-plus-graph-analysis
  architecture of production AML platforms, with reproducible results, explainability, and monitoring.
- **5.4 Contributions to knowledge:** an empirical RF-vs-GNN comparison on Elliptic reproducing a
  published benchmark; an explainable, monitoring-capable analyst console; a documented iterative
  methodology (synthetic → real graph).
- **5.5 Recommendations / future work:** probability calibration; decision-threshold tuning;
  temporal GNNs (e.g. EvolveGCN); a graph database (Neo4j) for richer network queries; real-time
  ingestion from a live feed; entity/identity resolution; testing on other datasets (e.g. IEEE-CIS).
- **5.6 Limitations** (if not folded into 5.5).

---

## 4. DIAGRAMS TO PRODUCE (Chapter 3)

Generate with Graphviz (the report-writer skill has ready code). Base strictly on the facts above.

1. **Architecture diagram** — 3 tiers: React (pages listed) → Flask API (blueprints) → MySQL + model
   artifacts; arrows for request/response; note JWT between tiers.
2. **Use-case diagram** — actors **Analyst** (browse, score transaction, view network graph, view
   explanation, run live monitor, review/resolve alert, generate report) and **Administrator**
   (manage users, view model health/metrics); admin inherits login.
3. **Entity-Relationship Diagram** — the 8 tables in 2.6 with keys and relationships
   (user 1—* prediction, transaction 1—* prediction, prediction 1—* alert, transaction 1—* edge as
   source/target, user 1—* report).
4. **Data-flow / sequence diagram** — the scoring flow: analyst selects tx → API → predictor (RF live +
   GNN lookup) → store prediction → if flagged, open alert → return result + subgraph + explanation.
   Optionally a second sequence for the Live Monitor step-advance loop.

---

## 5. ABSTRACT (draft — refine after chapters are final)

> Money laundering moves an estimated 2–5% of global GDP each year, and the pseudonymous, high-volume
> nature of cryptocurrency has made illicit fund flows especially difficult to detect. This project
> designed and implemented Tracer, a machine learning-based financial fraud detection system for
> identifying illicit transactions in the Bitcoin transaction network. Following an initial iteration
> on the synthetic PaySim mobile-money dataset, the system was rebuilt on the Elliptic dataset of
> 203,769 real Bitcoin transactions and 234,355 payment-flow edges to enable genuine graph-based
> analysis. Two complementary models were developed and compared under a temporal train–test split:
> a Random Forest classifier over transaction features and a GraphSAGE graph neural network that
> additionally learns from each transaction's network neighbourhood. On the held-out test period the
> Random Forest achieved an illicit-class F1-score of 0.807 (precision 0.925, recall 0.716,
> AUC-ROC 0.944), reproducing the published benchmark for the dataset, while the GraphSAGE model
> demonstrated graph-native node classification. The models were delivered through a three-tier web
> application — a React console, a role-based Flask REST API, and a MySQL database — providing
> transaction scoring with a two-hop network visualisation, per-decision explainability, automated
> stream monitoring with alert generation, case management, and model-performance dashboards. The
> system was validated with an automated test suite of 29 passing tests. The work demonstrates, at
> academic scale, the machine-learning-and-graph-analysis architecture used by production anti-money
> laundering platforms.

*(~230 words; Nigerian abstracts are usually 200–300.)*

---

## 6. HANDY NUMBERS (quick reference while writing)

203,769 nodes · 234,355 edges · 49 time steps · 166 features · 2.2% illicit / 20.6% licit / 77.1% unknown
· 46,564 labelled · train 29,894 (3,462 illicit) / test 16,670 (1,083 illicit) · split at step 34/35
· RF F1 0.807 / GNN 0.697 / combo 0.707 · RF confusion TP776 FP65 FN307 TN15522 · feature importance
local 76.5% / aggregate 23.5% · 29 tests · 8 DB tables · 2 roles · thresholds RF 0.9 / GNN 0.99 · alert budget 25.
