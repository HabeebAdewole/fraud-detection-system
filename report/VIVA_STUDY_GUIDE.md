# TRACER — Everything You Need To Know
### Your defence study guide. Plain English. Short answers. Memorise these.

---

## HOW TO USE THIS

Every answer here is **2–4 sentences**. That's on purpose — a short, confident answer
beats a long rambling one every time. Say your answer, then **stop talking**. If they
want more, they'll ask.

**Your 7-day plan:**

| Day | Read | Goal |
|---|---|---|
| 1 | Sections 1 + 2 | Be able to say what you built in 60 seconds |
| 2 | Section 3 (Data) | Answer any data question cold |
| 3 | Section 4 (Models) | Explain RF and GraphSAGE to a non-technical person |
| 4 | Section 5 (Results) | Know your numbers by heart |
| 5 | Section 6 (System) | Walk through the app without looking |
| 6 | Section 7 (Hard questions) | Handle the traps |
| 7 | Section 8 + practice demo | Rehearse out loud, twice |

**Rule: say every answer OUT LOUD.** Reading is not the same as being able to say it.

---

# SECTION 1 — THE 60-SECOND VERSION

## Q: Tell me about your project.

> "I built a system called Tracer that detects illegal Bitcoin transactions using
> machine learning. It uses real Bitcoin data — about 200,000 transactions that
> forensic analysts have already labelled as legal or illegal. I trained two models
> on it: a Random Forest, which looks at each transaction's own details, and a graph
> neural network, which also looks at what a transaction is connected to. Then I built
> a web app where a fraud analyst can score transactions, see the results explained,
> and manage alerts."

**That's it. Don't say more unless asked.**

## Q: Why does this matter?

> "Money laundering is about 2 to 5 percent of the world's GDP every year. Criminals
> have moved into cryptocurrency because it's fast and you don't need a bank. But
> there are too many transactions for humans to check by hand, so you need software
> that automatically flags the suspicious ones."

## Q: What makes yours different from other projects?

> "Three things. Most fraud detection looks at each transaction alone — mine also looks
> at the network of connections between transactions, because money laundering works by
> passing money through chains. Second, my system explains why it flagged something,
> not just that it did. Third, it monitors continuously and creates alerts on its own,
> rather than waiting for someone to click a button."

---

# SECTION 2 — THE 5 QUESTIONS SHE ALREADY ASKED

*(She'll likely ask these again. Know them perfectly.)*

## Q1: What methodology did you use?

> "I used **CRISP-DM** for the machine learning part — that's a standard six-step
> process for data projects: understand the problem, understand the data, prepare
> the data, build the model, evaluate it, then deploy it. For building the actual
> web app I used an **iterative approach**, meaning I built it in two rounds rather
> than all at once."

**If she asks "what were the two rounds?"**
> "Round one I built everything using PaySim, a fake mobile money dataset, just to get
> the pipeline working. Round two I rebuilt it on Elliptic, which is real Bitcoin data,
> because PaySim had no real network of connections to analyse."

## Q2: What's the dimension of your data?

> "The main file is **203,769 rows by 167 columns**. The first column is the transaction
> ID, the second is the time step, and the other **165 are the actual features** the
> model learns from. There's a second file with the labels, and a third file with
> **234,355 rows** listing which transactions connect to which — that's the network."

**If she asks "why 165 and not 166?"**
> "I removed the time step from the training features on purpose. I only use it to split
> the data into training and testing. If I left it in, the model could learn things about
> specific time periods instead of learning what fraud actually looks like."

## Q3: Where did you get the data and how did you clean it?

> "It's the **Elliptic dataset**, published by a blockchain forensics company called
> Elliptic together with MIT and IBM. I downloaded it from Kaggle. Before I used it,
> I ran a data quality check — and I found it needed no cleaning, because the company
> that published it had already cleaned it. I checked for missing values, duplicates,
> and broken connections, and there were **zero of each**."

**Then immediately add this — she WANTS to hear about problems:**
> "But the dataset does have real problems. The biggest one is that **77% of the
> transactions have no label** — nobody knows if they're legal or illegal. So I could
> only train and test on the 46,564 that are labelled. It's also very imbalanced —
> only about 10% of the labelled ones are illegal — and the feature names are hidden
> for privacy, so I can't say what any individual column means."

## Q4: How did you process the data?

Count these on your fingers — **8 steps**:

> "One, I merged the features file with the labels file. Two, I filtered down to only
> the labelled transactions. Three, I converted the labels to numbers — illegal is 1,
> legal is 0. Four, I dropped the ID column and the time step column. Five, I split
> the data by time: I trained on time steps 1 to 34 and tested on 35 to 49. Six, I used
> SMOTE to balance the training data. Seven, I standardised the numbers. Eight, for the
> graph model, I built the network from the connections file."

**The sentence that earns you marks — say it without being asked:**
> "Steps six and seven were applied to the training data only. If I had balanced or
> scaled the test data too, information would leak from the test set into training and
> my results would be falsely high."

## Q5: How did you convert categorical data to numeric?

> "In the Elliptic dataset the features were already numbers, so the only thing I
> needed to convert was the label itself — it comes as text, and I turned it into 1
> for illegal and 0 for legal. In my first version using PaySim, there was a real text
> column called `type` with five values like TRANSFER and PAYMENT, and I used **one-hot
> encoding** to turn that one column into five yes/no columns."

**If she asks "what is one-hot encoding?"**
> "It makes one column for each category and puts a 1 in the one that matches and 0 in
> the rest. I used it instead of just numbering them 1 to 5, because numbering would
> tell the model that TRANSFER is bigger than PAYMENT, which is meaningless."

---

# SECTION 3 — THE DATA (know this cold)

## Q: What exactly is in the Elliptic dataset?

> "It's a slice of the real Bitcoin blockchain. Each row is one Bitcoin transaction,
> and there are 203,769 of them. They're connected by 234,355 links, where a link means
> money flowed from one transaction into the next. The data covers 49 time periods,
> about two weeks each."

## Q: An important one — are the rows accounts or transactions?

> "**Transactions, not accounts.** That's how Bitcoin works — money flows from
> transaction to transaction, not between named accounts like a bank. So each dot in
> my network is a transaction, and each line is money moving."

*(This one catches people out. Know it.)*

## Q: What are the labels?

> "Three: **illicit** meaning illegal, that's 2.2%. **Licit** meaning legal, 20.6%.
> And **unknown**, which is 77.1% — nobody has checked those."

## Q: Why can't you use the 77% unknown ones?

> "Because supervised learning needs the right answer to learn from. Without labels
> I can't train on them and I can't measure whether I got them right. But my system
> can still *score* them — and that's actually the realistic case, because in real
> life you're always predicting things nobody has confirmed yet."

## Q: What data quality problems did you find? (Know all five)

| Problem | What I did about it |
|---|---|
| **77% unlabelled** | Trained and tested only on the 46,564 labelled ones |
| **Very imbalanced** — 10% illegal | Used SMOTE to balance the training data |
| **Feature names hidden** | Explained results by *group* — the transaction's own info vs its network info |
| **Network is thin** — average of 2 connections per transaction | Reported it honestly; it limits how much the graph model can learn |
| **Behaviour changed mid-test** — a dark web market was shut down | Reported it as a limitation instead of hiding it |

## Q: What are your exact numbers after processing?

- Started with: **203,769** transactions
- Labelled only: **46,564**
- Training (steps 1–34): **29,894** — of which 3,462 illegal
- After SMOTE: **52,864** — now half and half
- Testing (steps 35–49): **16,670** — of which 1,083 illegal

---

# SECTION 4 — THE MODELS (explain like I'm not technical)

## Q: What is a Random Forest?

> "Imagine asking 200 people to look at a transaction and vote on whether it's fraud.
> Each person only gets to see part of the information, so they don't all make the same
> mistake. Then you count the votes. That's a Random Forest — 200 decision trees, each
> trained on a different random slice of the data, all voting together."

**What's a decision tree?**
> "A flowchart of yes/no questions. 'Is this value above X? If yes, go here. Is that
> value zero? If yes, probably fraud.' One tree on its own is weak and makes mistakes.
> Two hundred of them voting together is strong."

## Q: What is a graph neural network / GraphSAGE?

> "A normal model judges a transaction only by its own numbers. A graph neural network
> also looks at **who it's connected to** — a bit like judging someone partly by the
> company they keep. My model looks at each transaction's neighbours, and then its
> neighbours' neighbours. That's two hops."

**Why does that help with money laundering?**
> "Because laundering works by moving money through chains of transactions so that no
> single step looks strange. The evidence isn't in one transaction — it's in the pattern
> of connections. A model that only looks at transactions one at a time is blind to it."

## Q: Why two models instead of one?

> "To compare them fairly. One looks only at a transaction's own details, the other also
> uses the network. Testing both on the same data shows whether the network information
> actually adds anything — which is the main research question of my project."

## Q: What is SMOTE and why did you need it?

> "Only about 10% of my training data was fraud. If I trained on that directly, the model
> would learn to just say 'not fraud' every single time — it would be right 90% of the
> time and completely useless. SMOTE creates extra artificial fraud examples by blending
> real ones together, until it's 50-50. Then the model has to actually learn what fraud
> looks like."

**Why not just copy the fraud rows?**
> "Copying the same rows over and over makes the model memorise those exact examples.
> SMOTE creates new ones that are similar but not identical, so the model learns the
> pattern instead of the specific rows."

## Q: What is the temporal split and why did you use it?

> "I trained on the earlier time periods and tested on the later ones — train on steps
> 1 to 34, test on 35 to 49. It's like studying chapters 1 to 34 and being examined on
> chapters 35 to 49."

**Why not just split it randomly?**
> "Because in real life you always train on the past and predict the future. If I split
> randomly, transactions from the same time period — and even ones directly connected to
> each other — would end up on both sides. The model would effectively see some of the
> exam answers while studying. That's called **data leakage**, and it makes your results
> look better than they really are."

---

# SECTION 5 — THE RESULTS (know these numbers by heart)

## Q: What were your results?

| Model | Precision | Recall | F1 | AUC |
|---|---|---|---|---|
| **Random Forest** | 92.5% | 71.6% | **0.807** | 0.944 |
| GraphSAGE (graph model) | 84.7% | 59.3% | 0.697 | 0.897 |
| Both combined | 87.4% | 59.4% | 0.707 | 0.868 |

> "The Random Forest was best, with an F1 score of 0.807."

## Q: What do those words actually mean?

**Learn these four. They will definitely be asked.**

> **Precision — "when I shout fraud, how often am I right?"**
> Mine is 92.5%. So about 9 out of every 10 alarms I raise are genuine.

> **Recall — "out of all the fraud that exists, how much did I catch?"**
> Mine is 71.6%. So I catch about 7 out of every 10 illegal transactions.

> **F1 — one number that balances precision and recall.**
> You need it because you can cheat either one alone. Flag everything and recall is
> 100% but precision is terrible. Flag almost nothing and precision looks perfect but
> you catch nothing. F1 stops you gaming it.

> **AUC — how well the model ranks fraud above non-fraud, at any cut-off.**
> Mine is 0.944 out of 1. Half, 0.5, would mean random guessing.

**Why not just use accuracy?**
> "Because only 2% of transactions are illegal. If I said 'nothing is fraud' for every
> single transaction, I'd be 98% accurate and catch nothing. Accuracy is meaningless
> when the classes are this imbalanced."

## Q: Is 0.807 good?

> "Yes — the researchers who published this dataset got about 0.79 using the same model
> and the same test split. Mine came out at 0.807, so I **reproduced their published
> result**. That's the strongest evidence that my pipeline is correct."

*(This is your single best fact. Lead with it whenever results come up.)*

## Q: Your confusion matrix — what does it say?

Random Forest on the test set:

|  | Model said FRAUD | Model said CLEAN |
|---|---|---|
| **Actually fraud** | **776** ✅ caught | **307** ❌ missed |
| **Actually clean** | **65** ⚠️ false alarm | **15,522** ✅ correct |

> "I caught 776 of 1,083 illegal transactions, missed 307, and raised only 65 false
> alarms out of more than 15,000 legitimate transactions."

## Q: Why is recall only 71.6%? You miss almost 30%.

**Handle this confidently — it's a strength, not a weakness:**

> "Two reasons. First, a real event: a dark web marketplace was shut down partway
> through my test period, at time step 43. That changed how criminals behaved. My model
> was trained on how they behaved *before* the shutdown, so it missed some of the new
> patterns. The researchers who published the dataset reported exactly the same drop.
> That's called **concept drift**, and it's a real problem for any deployed system —
> it's why real fraud systems have to be retrained regularly."

## Q: Why did the graph model lose to the simpler one?

**Three reasons — give all three, it shows depth:**

> "First, the dataset's features already include summaries of each transaction's
> neighbours, so the Random Forest is getting graph information indirectly through its
> input — about 23.5% of its decision weight comes from those neighbour features.
> Second, the network is very thin — each transaction has only about 2 connections on
> average, so there just isn't much neighbourhood for the graph model to learn from.
> Third, this matches the published research — Weber and colleagues also found Random
> Forest beat their graph model on this dataset."

**So was the graph model a waste?**
> "No. It proves the concept works on raw network structure, without needing someone to
> hand-engineer neighbour features first. On a dataset without that engineering, the
> graph model is the only one that could use the network at all."

---

# SECTION 6 — THE SYSTEM (walk through it without looking)

## Q: Describe your system architecture.

> "It's a **three-tier architecture**. The top tier is the interface, built in React —
> that's what the analyst sees and clicks. The middle tier is the logic, a Flask API in
> Python — it checks who you are, runs the models, and decides what to do. The bottom
> tier is storage — a MySQL database plus the saved model files."

**Why three tiers?**
> "So each part can be changed without breaking the others. I could redesign the whole
> interface without touching the models."

## Q: What are your database tables? (There are 8)

| Table | What it holds |
|---|---|
| `user` | Accounts and roles |
| `transaction` | The 203,769 Bitcoin transactions |
| `edge` | The 234,355 connections — this is the network |
| `prediction` | Every score the system has produced |
| `alert` | Flagged cases for the analyst to review |
| `report` | Records of exported reports |
| `model_metrics` | The performance scores of each model |
| `monitor_state` | Where the live monitor has reached |

## Q: Walk me through what happens when you score a transaction.

> "The analyst picks a transaction and clicks. The browser sends a request with the
> login token. The API checks the token and the user's role, then loads the transaction.
> The Random Forest runs on it and produces a probability. If that probability is above
> 0.9, the system automatically creates an alert. Then it sends back three things: the
> score, the transaction's network neighbourhood, and the explanation of why it scored
> that way."

## Q: What are the two user roles?

> "**Fraud Analyst** — scores transactions, runs the monitor, handles alerts, exports
> reports. **Administrator** — manages user accounts and views the model performance
> dashboards. The roles are checked on the server, so an analyst can't get to admin
> pages even if they try the URL directly."

## Q: What is the Live Monitor and why does it matter?

> "It's what makes this a *monitoring* system instead of just a lookup tool. It replays
> the test period as if transactions were arriving live. Each step, it automatically
> scores every transaction in that batch — no clicking required — and raises alerts on
> the highest-risk ones."

**What is the alert budget?**
> "Only the top 25 highest-scoring transactions per step become alerts. Real analyst
> teams can only review so many cases a day, so flooding them with hundreds of alerts
> is useless. It's a capacity limit — the system still counts every threshold crossing,
> it just doesn't create an alert for all of them."

## Q: What does the explainability panel do?

> "It shows *why* a transaction got its score. It breaks the score down into how much
> came from the transaction's own details versus how much came from its network
> connections. For example, on one transaction 77% of the decision came from its own
> features and 23% from its neighbours."

**How does it work?**
> "It's called decision-path attribution. It walks through every tree in the forest and
> records how much each feature changed the prediction at each step. The parts add up
> exactly to the final score — I have an automated test that checks this."

**Why not use SHAP, the standard library?**
> "I tried. SHAP depends on a library called numba, and Windows security policy on my
> machine blocks it. So I implemented the underlying method myself in NumPy. It's the
> same technique SHAP is built on."

*(This is genuinely impressive — say it with confidence.)*

## Q: How did you test the system?

> "Two ways. For the models, I tested on data they'd never seen — the later time
> periods. For the software, I wrote **29 automated tests** that all pass. They check
> that login works, that wrong passwords are rejected, that an analyst can't reach admin
> pages, that bad input gives a proper error instead of crashing, that the model gives
> the same answer twice for the same input, and that the explanation adds up correctly."

---

# SECTION 7 — THE HARD QUESTIONS (traps)

## Q: Why can't I just type in a new transaction to test it?

> "Because the system scores transactions in the context of the real Bitcoin network.
> A made-up transaction has no position in that network — no connections, no history.
> Also, the features are anonymised, so there are no meaningful values to type in.
> In a real deployment the transactions would arrive automatically from a live feed,
> not be typed in by hand."

## Q: So it only works on data where you already know the answer?

> "No — and this is important. **77% of the dataset has no label at all.** When I score
> one of those, nobody knows the answer, including me. That's genuine prediction. The
> labelled part is only how I *proved* the model works before trusting it."

## Q: Why does an illegal transaction have legal ones around it?

> "Because that's exactly what money laundering is. Dirty money is only useful once it
> reaches the legitimate economy, so illegal funds always end up touching legal services
> like exchanges. Those legal neighbours are the **exit points**, not proof of innocence."

## Q: Is this real-time?

> "Not live — it replays the dataset's own timeline. But the screening logic is
> identical to what a real-time system would do. Connecting it to a live blockchain
> feed is listed in my future work."

## Q: What are the limitations of your project? (Know 5)

> "One, the feature names are hidden, so I can't say what any individual feature means.
> Two, only 23% of the data is labelled. Three, behaviour changed partway through my
> test period, which lowered my recall. Four, my results are specific to Bitcoin and to
> this time period. Five, the system runs locally as a demonstration — it isn't hardened
> for real deployment."

## Q: What would you do differently or next?

> "Four things. Calibrate the probabilities so that 90% really means 90%. Tune the alert
> thresholds using a separate validation period instead of fixing them by hand. Try a
> temporal graph model like EvolveGCN that adapts as behaviour changes. And connect it
> to a live data feed instead of replaying a saved dataset."

## Q: Did you use AI to build this?

**Answer honestly and confidently:**
> "I used AI assistance for parts of the coding, the same way I'd use documentation or
> Stack Overflow. But I made the design decisions — choosing the dataset, choosing the
> temporal split, deciding to compare two models, setting up the alert budget — and I
> can explain and defend every part of how it works."

*(Then prove it by answering their next question well. That's the real test.)*

---

# SECTION 8 — PLAIN ENGLISH DICTIONARY

Big word → what it actually means:

| Term | In plain English |
|---|---|
| **Feature** | A column of data. One piece of info about a transaction. |
| **Label** | The right answer — illegal or legal. |
| **Node** | A dot in the network. Here, one transaction. |
| **Edge** | A line in the network. Money flowing between two transactions. |
| **Supervised learning** | Learning from examples where you already know the answer. |
| **Classification** | Sorting things into categories. Here: illegal or legal. |
| **Training** | Showing the model examples so it learns the pattern. |
| **Overfitting** | Memorising the examples instead of learning the pattern. |
| **Data leakage** | The model accidentally sees info it wouldn't have in real life. |
| **Class imbalance** | One category is far rarer than the other. |
| **Ensemble** | Many models voting together instead of one deciding alone. |
| **Message passing** | How a graph model shares info between connected nodes. |
| **Inference** | Using a trained model to make a prediction. |
| **Concept drift** | The real world changes, so the model gets stale. |
| **Hyperparameter** | A setting you choose before training (e.g. 200 trees). |
| **Threshold** | The cut-off score above which you call something fraud. |
| **API** | The messenger between the interface and the logic. |
| **JWT / token** | A digital pass proving you're logged in. |
| **Three-tier** | Interface / logic / storage kept separate. |

---

# SECTION 9 — IF YOU GET STUCK

**You will not know every answer. That's normal.** What matters is how you handle it.

**Don't say:** "I don't know." *(dead end)*
**Do say:** *"I didn't test that specifically, but based on how the model works I'd expect… "*

**If you genuinely don't know:**
> "That's outside what I covered, but it's a good extension — I'd approach it by…"

**If they find a real flaw:**
> "You're right, that's a limitation. What I'd do to fix it is…"
*(Agreeing with a valid criticism makes you look confident, not weak. Arguing makes it worse.)*

**If you blank completely:**
> "Can I come back to that one?" — then breathe, and continue.

**Three things to always steer back to:**
1. *"I reproduced the published benchmark — 0.807 against their 0.79."*
2. *"I used a temporal split so there's no data leakage."*
3. *"Every prediction is explained, and I verified the explanation adds up exactly."*

---

# YOUR ONE-PAGE CHEAT SHEET

**Numbers:** 203,769 transactions · 234,355 connections · 49 time periods · 167 columns
(165 used) · 46,564 labelled · 77% unknown · train 1–34 / test 35–49

**Results:** RF — precision 92.5%, recall 71.6%, **F1 0.807**, AUC 0.944
GNN — F1 0.697 · Benchmark to beat: **0.79** ✅

**Errors:** caught 776 · missed 307 · false alarms 65

**Models:** Random Forest = 200 trees voting · GraphSAGE = looks at neighbours, 2 hops

**Why RF won:** features already contain neighbour summaries + the network is thin
(2 connections average)

**Why recall is 71.6%:** dark market shut down at step 43 = concept drift

**System:** React → Flask → MySQL · 8 tables · 2 roles · 29 tests passing

**Best fact:** *I reproduced a peer-reviewed published result.*
