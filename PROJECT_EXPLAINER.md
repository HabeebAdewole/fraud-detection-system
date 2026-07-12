# Sentinel — Plain-English Project Explainer
*Read this twice and you can defend every layer of the system.*

---

## The one-sentence version

> **I built a web-based anti-money-laundering system that scores real Bitcoin
> transactions for illicit activity using two machine-learning models — a
> feature-based Random Forest and a graph neural network that also looks at
> each transaction's position in the payment network — and routes flagged
> transactions to human analysts through an alert workflow.**

---

## 1. The problem

Criminals launder money through cryptocurrency. Manual review can't keep up:
Bitcoin alone processes hundreds of thousands of transactions a day. Banks and
exchanges need systems that **automatically estimate the risk of every
transaction** and put only the suspicious ones in front of a human. That is
what commercial platforms (Sardine, Feedzai, Chainalysis) sell — and what this
project demonstrates at academic scale.

## 2. The data — what exactly am I looking at?

The **Elliptic dataset**: a real slice of the Bitcoin blockchain published for
research (Weber et al., 2019, MIT-IBM Watson AI Lab + Elliptic Ltd).

- **203,769 nodes. Each node is one Bitcoin transaction** (not an account —
  in Bitcoin, money flows from transaction to transaction, so transactions
  ARE the natural nodes).
- **234,355 edges.** An edge means bitcoin flowed from one transaction into
  the next. The edges are real payment flows.
- **166 features per transaction** — anonymised by Elliptic (only feature 1,
  the time step, is documented). They describe the transaction itself and
  aggregate statistics of its neighbourhood.
- **Labels:** 2% *illicit* (dark markets, scams, ransomware), 21% *licit*
  (exchanges, miners, legitimate services), **77% unknown — no one knows.**
- **49 time steps** ≈ two weeks apart each, covering ~3 years.

### Why "unknown" is a feature, not a flaw
When my system scores an unknown-label transaction it is doing **exactly what
a deployed fraud system does**: making a prediction where no answer key
exists. The labeled 23% is how I *prove* the models work; the unknown 77% is
the live work the system exists to do.

## 3. The two models — and why there are two

### Model A: Random Forest ("the paperwork detective")
Looks only at a transaction's own 166 features. 200 decision trees vote.
Trained with SMOTE to handle class imbalance.
- **Test results: F1 = 0.807, precision 92.5%, recall 71.6%, AUC 0.944.**
- The published benchmark for this exact setup (Weber et al.) is F1 ≈ 0.79 —
  **my result reproduces the peer-reviewed literature.**

### Model B: GraphSAGE, a Graph Neural Network ("the network detective")
Doesn't just read the transaction's own features — it **mathematically mixes
in the features of its neighbours, and its neighbours' neighbours** (2 layers
of "message passing" = 2 hops of network context). Money laundering is a
*network* crime — layering, mixing, peel chains — so who you transact with
carries signal that isolated features miss.
- **Test results: F1 = 0.697.**

### Why do I show both?
Because that's the honest, scientific comparison the original paper made. On
this dataset the Random Forest wins on F1 — Elliptic's features are already
partly neighbourhood-aggregated, so the RF secretly benefits from graph
information too. But the GNN demonstrates true *graph-native* learning, and
when the two models disagree on a transaction, **the gap between their scores
is the network's contribution made visible.**

### How were they tested? (This matters — say it proudly)
**Temporal split**: trained on time steps 1–34, tested on 35–49. The models
were evaluated on the *future* they had never seen — not a random shuffle.
This is the deployment-realistic way to test, and it's what the paper does.

## 4. The system around the models

Three-tier architecture:

| Tier | Tech | What it does |
|---|---|---|
| Presentation | React + Tailwind ("Sentinel" console) | Login, browse/search transactions, score them, see the network graph, manage alerts, reports, admin |
| Application | Flask REST API + JWT auth | Auth service, transaction service, ML prediction service (loads both models), report service |
| Data | MySQL + model artifacts | 203k transactions, 234k edges, predictions, alerts, users, model metrics |

**The flow:** analyst logs in → browses/searches real transactions → clicks
one → backend scores it with RF (live) and GraphSAGE → result stored in
`Prediction` → if flagged illicit, an `Alert` opens automatically → analyst
investigates (with the 2-hop network view), adds notes, resolves → reports
can be exported as CSV. Admins manage users and see the model benchmark page.

**Roles:** *Fraud Analyst* (screen, alerts, reports) and *System
Administrator* (user management, model health) — enforced server-side.

## 5. "Why can't I type in a new transaction?" (Anticipate this question)

Because the system scores transactions **in the context of the real Bitcoin
graph** — a hand-typed transaction has no position in the network, no
neighbours, no history. That's not a limitation; it's the design insight:
- It makes the system **evasion-resistant** (you can't craft innocent-looking
  inputs — the network context isn't yours to fake).
- It mirrors production reality: real systems score transactions arriving
  from the payment stream, not values typed into a form.

## 6. Demo script (5 minutes)

1. **Login** as `analyst` → the Overview console loads.
2. **Model Health (as `admin`, or show later):** "Before trusting any score,
   here's the validation — F1 0.807 on 16,670 held-out future transactions,
   matching the published benchmark."
3. **Illicit hub:** search a known illicit transaction with many connections
   (see `.plans/demo-shortlist.md`) → big red network on screen. "This is a
   real dark-market-linked Bitcoin transaction and its actual payment
   neighbourhood."
4. **The live prediction (the key moment):** filter **Unknown** → score one →
   "No ground truth exists for this transaction anywhere. The model estimates
   X% illicit probability. This is genuine inference, the same act a bank's
   system performs on your card swipe."
5. **RF vs GNN toggle:** show a transaction where the scores differ. "The
   difference is the network's contribution — this is graph analysis working."
6. **Alert workflow:** the flagged unknown created an open alert → add a
   note → resolve. "The human stays in the loop — exactly how commercial
   fraud operations work."

## 6b. How to read the graph view (anticipate THIS question)

**"Why does an illicit transaction have licit nodes around it?"**
Because that's what laundering *is*. Dirty funds are only useful once spent,
so every illicit flow must eventually touch legitimate services (exchanges,
merchants). The licit nodes near an illicit transaction are the **exits** —
the cash-out points — not evidence of innocence. Likewise most neighbours are
grey (unknown) because launderers deliberately route through anonymous
intermediaries (and 77% of the dataset is unlabeled anyway).

Key line: *"Illicit transactions connecting to licit ones isn't a
contradiction — it's the definition of money laundering. The GNN doesn't
naively vote on neighbour labels; it learns the feature signature of 'funds
fanning out through anonymous intermediaries toward exchange-like endpoints'."*

## 7. Honest limitations (owning these earns marks)

- Elliptic's features are anonymised — I can't explain *what* feature 94
  means, only what the models learned from it.
- Static dataset, not a live blockchain feed; ingestion would be future work.
- GNN underperforms RF here (consistent with the paper; the features already
  encode neighbourhood info). Future work: RF + GNN-embedding ensembles,
  temporal GNNs (EvolveGCN), threshold tuning, probability calibration.
- ~28% of illicit transactions in the test window are missed (recall 71.6%) —
  partly due to a real-world event: a dark-market shutdown at step 43 changed
  fraud patterns mid-test. Great example of concept drift to discuss.

## 8. Glossary (30-second refreshers)

- **Node / edge:** a dot and a line in a graph. Here: a transaction, and a
  bitcoin flow between two transactions.
- **Hop:** one step along an edge. 2-hop = neighbours-of-neighbours.
- **Message passing:** how a GNN works — each node repeatedly averages in its
  neighbours' feature vectors, so after 2 rounds every node "knows about" its
  2-hop neighbourhood.
- **F1 score:** the balance of precision (flags that were right) and recall
  (fraud that got caught). One number to compare models on imbalanced data.
- **Temporal split:** train on the past, test on the future. No time travel.
- **SMOTE:** oversampling technique that synthesises minority-class examples
  so the model doesn't just learn "predict licit always."
