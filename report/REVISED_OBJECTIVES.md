# Revised Objectives — paste-ready replacements

Three edits are needed, because changing the objectives changes what the report
must contain and what Chapter 5 claims was achieved.

| Edit | Where | Why |
|---|---|---|
| A | Replace §1.3 | The new objectives themselves |
| B | Insert a new §3.4.3 | Objective 1 is now EDA, and the report currently has none |
| C | Replace §5.3 | It maps objectives to chapters; the old mapping is now wrong |

---

# EDIT A — replace section 1.3 entirely

## 1.3 Aim and Objectives of the Study

The aim of this study is to design and implement a machine learning-based
financial fraud detection system that identifies illicit transactions in a real
transaction network and supports analysts with automated screening, alerting,
and explainable results.

The specific objectives are to:

i. carry out an exploratory analysis of the datasets used in the study. This
covers the PaySim synthetic mobile-money dataset and the Elliptic Bitcoin
transaction dataset, and involves establishing the size and structure of each,
the composition of their features, the distribution of their class labels, the
connectivity of the Elliptic transaction graph, and any data quality problems
that would affect modelling.

ii. build a fraud detection system using a Random Forest classifier and a graph
neural network. This involves preparing the data through label encoding, class
rebalancing with SMOTE, and a temporal train-test split; training a Random Forest
on the transaction features and a GraphSAGE network that additionally learns from
each transaction's position in the payment-flow graph; and delivering both models
through a web-based console in which an analyst can screen transactions, view the
network around a scored transaction, review the alerts raised, and inspect the
reasons behind each prediction.

iii. test and evaluate the developed models. This involves measuring accuracy,
precision, recall, F1-score, and AUC-ROC on a held-out test period, comparing
the models against each other and against the published benchmark for the
Elliptic dataset, and validating the surrounding application through an
automated test suite.

---

# EDIT B — insert as a new section 3.4.3

Place it directly after 3.4.2 (Iteration Two: The Elliptic Dataset). Renumber
the existing "3.4.3 The Machine Learning Pipeline" to **3.4.4**.

## 3.4.3 Exploratory Data Analysis

Both datasets were profiled before any model was trained, to establish their
structure and to identify problems that would affect the modelling decisions
taken later.

The PaySim dataset contains approximately 6.3 million simulated mobile-money
transactions across 744 hourly time steps, of which 0.13% are labelled
fraudulent (Lopez-Rojas et al., 2016). Each transaction carries a type drawn
from five categories (CASH-IN, CASH-OUT, DEBIT, PAYMENT and TRANSFER), an
amount, and the balances of the originating and destination accounts before and
after the transfer. Two properties of the dataset shaped the decision to move on
from it. Fraud is confined to the CASH-OUT and TRANSFER types, and the fraudulent
cases follow a near-deterministic pattern in which the originating balance is
emptied. More importantly, the dataset records no relationships between
transactions, so the network dimension central to this project could not be
studied on it at all.

The Elliptic dataset is distributed as three files. The feature file holds
203,769 rows and 167 columns: the first column is the transaction identifier,
the second is the time step, and the remaining 165 are anonymised numerical
features. The class file holds one label per transaction, and the edge file
holds 234,355 directed payment flows between transactions.

Profiling the dataset established four things.

**Completeness.** The dataset contains no missing values in either the feature
file or the class file, no duplicate transaction identifiers, and no duplicate
edges. Every edge references transactions that exist in the node set, and no
transaction is isolated. The dataset therefore required no cleaning in the
conventional sense, having been prepared by its publishers before release. This
was verified directly rather than assumed.

**Label distribution.** Of the 203,769 transactions, 4,545 (2.2%) are labelled
illicit and 42,019 (20.6%) licit, while 157,205 (77.1%) carry no label at all.
Supervised learning is therefore restricted to the 46,564 labelled transactions,
within which the illicit class accounts for 9.76%. The absence of labels on
three quarters of the data is the most significant limitation of the dataset,
and it is a limitation of incompleteness rather than of quality: the records are
complete, but their ground truth is unknown.

**Class imbalance.** An illicit rate of 9.76% among labelled transactions is
severe enough that a classifier trained without correction would minimise its
error by predicting the majority class everywhere. This finding is what
motivated the use of SMOTE on the training partition, described in Section 3.4.4,
and the decision to report precision, recall and F1-score rather than accuracy.

**Graph connectivity.** The transaction graph is sparse. Transactions have a mean
degree of 2.3 and a median of 2, although the distribution has a long tail, with
the most connected transaction linked to 473 others. This is directly relevant to
the comparison drawn in Chapter Four: a graph neural network aggregates
information from a node's neighbours, and a neighbourhood of two nodes offers
limited structural signal to learn from.

---

# EDIT C — replace section 5.3 entirely

## 5.3 Achievement of the Objectives

Chapter One set three objectives. Each was achieved, as follows.

**Objective 1, to carry out an exploratory analysis of the datasets.** This was
achieved in Chapter Three. The PaySim dataset was profiled first, and the
analysis established that its fraud cases follow a near-deterministic balance
pattern and that it records no relationships between transactions. That second
finding is what prompted the change of dataset. The Elliptic dataset was then
profiled in detail: 203,769 transactions, 234,355 payment-flow edges, 49 time
steps, and 165 usable features per transaction. The analysis confirmed that the
data contains no missing values, duplicates or broken edges; established the
label distribution of 2.2% illicit, 20.6% licit and 77.1% unknown; quantified
the class imbalance at 9.76% illicit among labelled transactions; and measured
the sparsity of the transaction graph at a mean degree of 2.3. Each of these
findings shaped a later decision, from the use of SMOTE to the interpretation of
the graph model's performance.

**Objective 2, to build a fraud detection system using a Random Forest classifier
and a graph neural network.** This was achieved in Chapters Three and Four. The
data was prepared through label encoding, SMOTE rebalancing of the training
partition only, and a temporal train-test split at time step 34/35 matching the
protocol of the benchmark study. A Random Forest of 200 trees was trained on the
165 transaction features, and a GraphSAGE network of two SAGEConv layers with a
hidden dimension of 128 was trained on the transaction graph, giving each node a
two-hop receptive field. A third combined variant was also trained, in which the
Random Forest receives the GraphSAGE node embeddings alongside the original
features. All three were trained under identical conditions so that the
comparison would be fair.

The trained models were then delivered through a three-tier application, since a
model that cannot be reached by an analyst detects nothing in practice. The
presentation tier is a React console, the application tier a Flask REST API with
token authentication and server-side role enforcement, and the data tier a MySQL
database of eight tables holding the transaction graph, the predictions, and the
alerts raised from them. Through this console an analyst screens transactions
with either model, views the two-hop network around a scored transaction, reads a
per-decision explanation of the score, works through the alert queue, and exports
reports. Chapter Four documents each of these with screenshots of the running
system.

**Objective 3, to test and evaluate the developed models.** This was achieved in
Chapter Four. The models were evaluated on the held-out test period of time steps
35 to 49, comprising 16,670 labelled transactions of which 1,083 are illicit. The
Random Forest achieved an illicit-class F1-score of 0.807 at a precision of 92.5%,
a recall of 71.6% and an AUC-ROC of 0.944; GraphSAGE reached 0.697 and the
combined variant 0.707. The Random Forest result reproduces the published
benchmark for this dataset, which Weber et al. (2019) report at approximately
0.79 under the same protocol. The evaluation also examined the errors behind the
headline figures through confusion matrices, and attributed the recall shortfall
in part to the dark-market shutdown that occurs inside the test window. Beyond
the models, the application itself was validated by an automated test suite of
35 tests, all passing, covering authentication, role enforcement, input
validation, inference determinism and the correctness of the explanation
component.

---

# THINGS TO CHECK AFTER PASTING

1. **The web application now sits inside objective 2.** Objective 2 reads "build
   a fraud detection *system*", and its elaboration names the console explicitly,
   so Chapters Three and Four have an objective to answer to. This also matches
   the aim, which already speaks of a system rather than a model. If asked why
   the application belongs under objective 2, the answer is that a model which no
   analyst can reach detects nothing in practice, so building the system is part
   of building the detection capability rather than a separate exercise.

2. **The literature review is no longer a stated objective.** This matters
   little. A review chapter that supports the work without being a numbered
   objective is normal.

3. **Test count.** The suite now has 35 tests, not 29. Search the document for
   "29" and update any remaining references.

4. **Renumber** the old 3.4.3 to 3.4.4, and check that any cross-reference to
   "Section 3.4.3" elsewhere in the document still points at the right thing.

5. **Table of contents** needs updating in Word after these edits
   (References tab, Update Table).
