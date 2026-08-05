// Defence deck v2 — 15 slides, full-size screenshots, speaker notes.
// Run: node report/build_slides_v2.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CREST = "C:\\Users\\brigh\\Downloads\\crescent logo.jpg";
const SHOTS = path.join(ROOT, "report", "screenshots");
const OUT = path.join(ROOT, "report", "Tracer_Defence_Slides_v3.pptx");
const shot = (f) => path.join(SHOTS, f);

const INK = "0B1220", INDIGO = "2B44E8", AMBER = "E0870B", RED = "E5484D";
const TEXT = "0B0C0E", MUTED = "6B7280", WHITE = "FFFFFF", LINE = "E6E4E0", TINT = "EEF1FE";
const F = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Adewole Habeeb Adebola";
pres.title = "Machine Learning-Based Financial Fraud Detection System";

let n = 0;
function chrome(s, dark) {
  n += 1;
  if (dark) {
    s.addShape(pres.ShapeType.roundRect, { x: 12.08, y: 0.22, w: 0.99, h: 0.79, fill: { color: WHITE }, rectRadius: 0.06 });
  }
  s.addImage({ path: CREST, x: 12.2, y: 0.32, w: 0.75, h: 0.587 });
  s.addText(String(n), { x: 12.2, y: 6.92, w: 0.75, h: 0.3, align: "right", fontFace: F, fontSize: 11, color: dark ? "8A93A6" : MUTED });
}
function heading(s, t, sub) {
  s.addText(t, { x: 0.6, y: 0.42, w: 11.3, h: 0.62, fontFace: F, fontSize: 30, bold: true, color: TEXT, margin: 0 });
  if (sub) s.addText(sub, { x: 0.6, y: 1.06, w: 11.0, h: 0.32, fontFace: F, fontSize: 14, color: MUTED, margin: 0 });
}
function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, fill: { color: fill || WHITE }, line: { color: LINE, width: 1 }, rectRadius: 0.08,
    shadow: { type: "outer", angle: 90, blur: 8, offset: 1, color: "9AA0AA", opacity: 0.18 },
  });
}
/** Numbered annotation beside a screenshot. */
function note(s, x, y, i, title, body, w) {
  s.addShape(pres.ShapeType.ellipse, { x, y: y + 0.04, w: 0.28, h: 0.28, fill: { color: INDIGO } });
  s.addText(String(i), { x, y: y + 0.04, w: 0.28, h: 0.28, align: "center", valign: "middle", fontFace: F, fontSize: 11, bold: true, color: WHITE, margin: 0 });
  s.addText(title, { x: x + 0.42, y, w: w, h: 0.28, fontFace: F, fontSize: 13, bold: true, color: TEXT, margin: 0 });
  s.addText(body, { x: x + 0.42, y: y + 0.3, w: w, h: 0.7, fontFace: F, fontSize: 11, color: MUTED, lineSpacing: 14.5, margin: 0 });
}

/* ═══ 1 — TITLE ═══════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("MACHINE LEARNING-BASED FINANCIAL\nFRAUD DETECTION SYSTEM", {
    x: 0.9, y: 1.55, w: 11.0, h: 1.6, fontFace: F, fontSize: 38, bold: true, color: WHITE, lineSpacing: 44, margin: 0 });
  s.addText("Detecting illicit Bitcoin transactions with Random Forest and a Graph Neural Network", {
    x: 0.9, y: 3.2, w: 10.4, h: 0.4, fontFace: F, fontSize: 15, color: "9AA6C4", italic: true, margin: 0 });
  s.addShape(pres.ShapeType.rect, { x: 0.9, y: 3.85, w: 2.6, h: 0.075, fill: { color: INDIGO } });
  s.addShape(pres.ShapeType.rect, { x: 3.5, y: 3.85, w: 1.5, h: 0.075, fill: { color: AMBER } });
  s.addShape(pres.ShapeType.rect, { x: 5.0, y: 3.85, w: 1.0, h: 0.075, fill: { color: RED } });
  s.addText([
    { text: "ADEWOLE HABEEB ADEBOLA\n", options: { fontSize: 17, bold: true, color: WHITE } },
    { text: "S122202011\n\n", options: { fontSize: 14, color: "9AA6C4" } },
    { text: "Supervisor:  Miss Saka B.A.", options: { fontSize: 14, color: "9AA6C4" } },
  ], { x: 0.9, y: 4.35, w: 6.5, h: 1.5, fontFace: F, margin: 0, lineSpacing: 22 });
  s.addText("Department of Computer Science\nCollege of Information and Communication Technology\nCrescent University, Abeokuta", {
    x: 0.9, y: 6.15, w: 8.0, h: 0.9, fontFace: F, fontSize: 11.5, color: "6E7A96", lineSpacing: 15, margin: 0 });
  chrome(s, true);
  s.addNotes(
`Good morning. My name is Adewole Habeeb Adebola, matric number S122202011, supervised by Miss Saka.

My project is a machine learning system that detects illicit Bitcoin transactions. It uses two different models and delivers them through a web console that a fraud analyst can actually work in.

Keep this short. Say your name, the title, and move to the next slide. Don't read the whole title out.`);
}


/* ═══ 2 — INTRODUCTION 1 ═══════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Introduction", "The scale of the problem");
  const stats = [
    { v: "2–5%", l: "of global GDP is laundered\nevery year (UNODC, 2011)", c: INDIGO },
    { v: "$154bn", l: "received by illicit crypto\naddresses in 2025 (Chainalysis)", c: AMBER },
    { v: "<1%", l: "of transactions are illicit —\nfinding them is the hard part", c: RED },
  ];
  stats.forEach((st, i) => {
    const x = 0.6 + i * 4.05;
    card(s, x, 1.68, 3.75, 1.95);
    s.addText(st.v, { x: x + 0.28, y: 1.88, w: 3.2, h: 0.75, fontFace: F, fontSize: 40, bold: true, color: st.c, margin: 0 });
    s.addText(st.l, { x: x + 0.28, y: 2.71, w: 3.2, h: 0.8, fontFace: F, fontSize: 12.5, color: MUTED, lineSpacing: 16, margin: 0 });
  });
  s.addText([{ text: "Money laundering", options: { bold: true } },
    { text: " is how criminal proceeds are disguised so they can be spent in the legitimate economy. Cryptocurrency has made this easier: value moves globally, quickly and pseudonymously, without a bank in the middle.", options: {} }],
    { x: 0.6, y: 4.0, w: 11.2, h: 0.8, fontFace: F, fontSize: 15, color: TEXT, lineSpacing: 22, margin: 0 });
  s.addText([{ text: "But the blockchain is also an opportunity. ", options: { bold: true, color: INDIGO } },
    { text: "Unlike banking data, which is locked inside private institutions, every Bitcoin transaction and every connection between transactions is permanently public — the complete transaction graph is available for analysis.", options: {} }],
    { x: 0.6, y: 4.95, w: 11.2, h: 0.9, fontFace: F, fontSize: 15, color: TEXT, lineSpacing: 22, margin: 0 });
  chrome(s, false);
  s.addNotes(
`Money laundering is disguising criminal money so it can be spent normally. The UN estimates 2 to 5 percent of world GDP goes through this every year — that's up to 2 trillion dollars.

Criminals moved into cryptocurrency because it's fast, global, and you don't need a bank. Chainalysis reported 154 billion dollars went to illicit crypto addresses in 2025.

But here's the interesting part, and it's the reason this project is possible. In normal banking, transaction records sit inside private banks. On Bitcoin, every transaction is public forever. So the whole network of who paid who is available to analyse. That's an opportunity traditional fraud detection doesn't have.

The last number matters too — under 1 percent of transactions are illicit. That imbalance is the core technical difficulty.`);
}


/* ═══ 3 — INTRODUCTION 2 ═══════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Introduction", "From rules, to machine learning, to the network");
  const steps = [
    { t: "Rule-based screening", d: "Hand-written conditions flag transactions above a threshold. Transparent, but brittle: it only catches what someone already thought of, floods analysts with false alarms, and criminals learn to structure activity just below the limits.", c: MUTED },
    { t: "Machine learning", d: "A classifier learns the signature of illicit activity from labelled history instead of fixed rules. Stronger, but the standard formulation judges each transaction alone.", c: AMBER },
    { t: "Graph-based learning", d: "Laundering is a network crime — funds are layered through chains of transfers so no single step looks unusual. A graph neural network reasons over those connections, not just the transaction's own attributes.", c: INDIGO },
  ];
  steps.forEach((st, i) => {
    const y = 1.68 + i * 1.6;
    s.addShape(pres.ShapeType.ellipse, { x: 0.6, y: y + 0.12, w: 0.5, h: 0.5, fill: { color: st.c } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.12, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F, fontSize: 16, bold: true, color: WHITE, margin: 0 });
    s.addText(st.t, { x: 1.35, y: y + 0.05, w: 10.4, h: 0.35, fontFace: F, fontSize: 17, bold: true, color: TEXT, margin: 0 });
    s.addText(st.d, { x: 1.35, y: y + 0.45, w: 10.4, h: 0.95, fontFace: F, fontSize: 13, color: MUTED, lineSpacing: 18, margin: 0 });
  });
  s.addText("This project builds Tracer: a system that scores real Bitcoin transactions with both approaches and delivers the results to a human analyst.",
    { x: 0.6, y: 6.5, w: 11.2, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: INDIGO, margin: 0 });
  chrome(s, false);
  s.addNotes(
`This slide is the argument for the whole project. Walk down the three levels.

One — rule-based systems. Somebody writes conditions: flag anything over this amount, from this country. The problem is it only catches what the author already imagined, it produces huge numbers of false alarms, and criminals just structure their transfers to stay under the limits.

Two — machine learning. Instead of rules, the model learns from labelled history what fraud looks like. Much better. But almost all of this work judges each transaction on its own.

Three — and this is my point. Money laundering is a network crime. Criminals deliberately move money through chains of transfers so no single step looks strange. If you only look at transactions one at a time you are blind to the pattern that defines the crime. That's why I used a graph neural network as well.

Then say: so Tracer does both, and compares them.`);
}


/* ═══ 4 — STATEMENT OF THE PROBLEM ═══════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Statement of the Problem");
  const probs = [
    { h: "Volume defeats manual review", d: "Hundreds of thousands of Bitcoin transactions are recorded daily. No team of analysts can inspect them by hand." },
    { h: "Rules produce noise and are evaded", d: "Fixed thresholds generate large volumes of false alarms that consume analyst capacity, and adversaries structure activity to stay just below them." },
    { h: "Isolated-transaction models are blind to the crime", d: "Classifying each transaction on its own attributes discards the layering structure through which laundering is actually executed." },
  ];
  probs.forEach((p, i) => {
    const y = 1.3 + i * 1.42;
    card(s, 0.6, y, 11.2, 1.22);
    s.addShape(pres.ShapeType.roundRect, { x: 0.9, y: y + 0.32, w: 0.42, h: 0.42, fill: { color: RED }, rectRadius: 0.06 });
    s.addText("!", { x: 0.9, y: y + 0.32, w: 0.42, h: 0.42, align: "center", valign: "middle", fontFace: F, fontSize: 18, bold: true, color: WHITE, margin: 0 });
    s.addText(p.h, { x: 1.55, y: y + 0.18, w: 10, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: TEXT, margin: 0 });
    s.addText(p.d, { x: 1.55, y: y + 0.56, w: 10, h: 0.55, fontFace: F, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0 });
  });
  card(s, 0.6, 5.62, 11.2, 1.15, TINT);
  s.addText([{ text: "What is needed:  ", options: { bold: true, color: INDIGO } },
    { text: "a system that learns from data rather than fixed rules, incorporates the transaction network into its reasoning, screens every transaction automatically, and explains its decisions so analysts can act on them.", options: { color: TEXT } }],
    { x: 0.95, y: 5.85, w: 10.5, h: 0.75, fontFace: F, fontSize: 14, lineSpacing: 20, margin: 0 });
  chrome(s, false);
  s.addNotes(
`Three problems, then what follows from them.

First, volume. Bitcoin records hundreds of thousands of transactions a day. Manual review cannot cover that.

Second, rule-based systems are the traditional answer, and they fail in two ways at once — they bury analysts in false alarms, and they're easy to evade once you learn the thresholds.

Third, and this is the gap my project targets: even when people use machine learning, they usually classify each transaction on its own. That throws away the network structure, which is exactly where laundering shows itself.

So the requirement is four things: learn from data, use the network, run automatically, and explain itself. Those four map directly onto what I built.`);
}


/* ═══ 5 — AIM AND OBJECTIVES ═══════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Aim and Objectives");
  card(s, 0.6, 1.25, 11.2, 1.15, TINT);
  s.addText("AIM", { x: 0.95, y: 1.42, w: 1.5, h: 0.28, fontFace: F, fontSize: 11, bold: true, color: INDIGO, charSpacing: 1.5, margin: 0 });
  s.addText("To design and implement a machine learning-based financial fraud detection system that identifies illicit transactions in a real transaction network and supports analysts with automated screening, alerting and explainable results.",
    { x: 0.95, y: 1.72, w: 10.5, h: 0.6, fontFace: F, fontSize: 14.5, color: TEXT, lineSpacing: 20, margin: 0 });
  s.addText("OBJECTIVES", { x: 0.6, y: 2.68, w: 3, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: MUTED, charSpacing: 1.5, margin: 0 });
  const objs = [
    { t: "Exploratory analysis of the datasets", d: "Profile the PaySim synthetic mobile-money dataset and the Elliptic Bitcoin transaction dataset: size, structure, feature composition, label distribution, graph connectivity, and any data quality problems." },
    { t: "Build the fraud detection system", d: "Prepare the data, train a Random Forest on the transaction features and a GraphSAGE graph neural network on the payment network, and deliver both through a web-based analyst console." },
    { t: "Test and evaluate the developed models", d: "Measure accuracy, precision, recall, F1-score and AUC-ROC on a held-out test period, compare the models against each other and the published benchmark, and validate the application with an automated test suite." },
  ];
  objs.forEach((o, i) => {
    const y = 3.08 + i * 1.28;
    s.addShape(pres.ShapeType.ellipse, { x: 0.6, y: y + 0.08, w: 0.46, h: 0.46, fill: { color: INDIGO } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.08, w: 0.46, h: 0.46, align: "center", valign: "middle", fontFace: F, fontSize: 15, bold: true, color: WHITE, margin: 0 });
    s.addText(o.t, { x: 1.3, y, w: 10.5, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: TEXT, margin: 0 });
    s.addText(o.d, { x: 1.3, y: y + 0.36, w: 10.5, h: 0.8, fontFace: F, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0 });
  });
  chrome(s, false);
  s.addNotes(
`Read the aim once, slowly. Then the three objectives — say the short version of each, not the paragraph.

One, exploratory analysis of the two datasets — PaySim and Elliptic.
Two, build the system using Random Forest and a graph neural network.
Three, test and evaluate the models.

If asked why the web application is under objective two: a model an analyst cannot reach detects nothing in practice, so building the system is part of building the detection capability, not a separate exercise.

If asked about methodology, the answer is the iterative and incremental model, with CRISP-DM for the machine learning part. That comes up on slide 8.`);
}


/* ═══ 6 — SIGNIFICANCE OF THE STUDY ═══════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Significance of the Study");
  const items = [
    { n: "01", t: "Demonstrates the production architecture", d: "Machine learning classification over a real transaction graph, combined with network analysis and delivered into an analyst's workflow — the shape used by commercial platforms, built at academic scale.", c: INDIGO },
    { n: "02", t: "Reproduces a published benchmark", d: "An empirical Random Forest versus GraphSAGE comparison on the Elliptic dataset under a leakage-free temporal protocol, matching the result reported by Weber et al. (2019).", c: AMBER },
    { n: "03", t: "Makes predictions explainable", d: "Regulators and investigators cannot act on scores they cannot interrogate. Every prediction is attributed to the feature groups that produced it.", c: RED },
    { n: "04", t: "Documents an honest methodology", d: "The move from synthetic data to a real transaction graph is recorded as it happened, as a realistic template for applied machine learning projects.", c: "4B5563" },
  ];
  items.forEach((it, i) => {
    const x = 0.6 + (i % 2) * 5.75, y = 1.35 + Math.floor(i / 2) * 2.65;
    card(s, x, y, 5.45, 2.35);
    s.addText(it.n, { x: x + 0.3, y: y + 0.22, w: 1, h: 0.4, fontFace: F, fontSize: 22, bold: true, color: it.c, margin: 0 });
    s.addText(it.t, { x: x + 0.3, y: y + 0.68, w: 4.85, h: 0.55, fontFace: F, fontSize: 15, bold: true, color: TEXT, lineSpacing: 19, margin: 0 });
    s.addText(it.d, { x: x + 0.3, y: y + 1.25, w: 4.85, h: 0.95, fontFace: F, fontSize: 11.5, color: MUTED, lineSpacing: 15, margin: 0 });
  });
  chrome(s, false);
  s.addNotes(
`Four points. Don't read them all in full — hit the headline of each.

One, it shows the architecture real anti-money-laundering platforms use, built end to end at academic scale.

Two, and this is the strongest fact in the whole project — I reproduced a published benchmark. Weber and colleagues reported an F1 of about 0.79 on this dataset. I got 0.807 using the same protocol. That means my pipeline is correct, and it's verifiable by anyone.

Three, explainability. In compliance work you cannot act on a score you can't question. Every prediction in my system comes with a breakdown of what drove it.

Four, I documented the methodology honestly, including changing datasets partway when the first one turned out to have no network to analyse.`);
}


/* ═══ 7 — RELATED WORKS ═══════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Related Works");
  const rows = [
    [{ text: "Author(s)", options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12 } },
     { text: "Title", options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12 } },
     { text: "Key finding", options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12 } }],
    ["Weber et al. (2019)", "Anti-Money Laundering in Bitcoin: Experimenting with Graph Convolutional Networks for Financial Forensics",
     "Introduced the Elliptic dataset. Random Forest was the strongest model at an illicit F1 of ≈0.79, ahead of the graph convolutional network."],
    ["Alarab, Prakoonwit & Nacer (2020)", "Competence of Graph Convolutional Networks for Anti-Money Laundering in Bitcoin Blockchain",
     "Interleaving graph convolutional and linear layers outperformed the original GCN configuration on the same dataset."],
    ["Pareja et al. (2020)", "EvolveGCN: Evolving Graph Convolutional Networks for Dynamic Graphs",
     "Using a recurrent network to evolve GCN weights across time steps beat the static GCN on evolving transaction graphs."],
    ["Motie & Raahemi (2024)", "Financial Fraud Detection Using Graph Neural Networks: A Systematic Review",
     "GNNs are consistently competitive with or superior to conventional baselines on relational fraud tasks; imbalance, drift and explainability remain open."],
  ];
  s.addTable(rows, {
    x: 0.6, y: 1.3, w: 12.1, colW: [2.3, 4.5, 5.3], fontFace: F, fontSize: 11.5, color: TEXT,
    border: { type: "solid", color: LINE, pt: 1 }, align: "left", valign: "middle",
    rowH: [0.4, 1.05, 1.0, 0.95, 1.05], margin: 0.09,
  });
  s.addText("Common gap: these are model experiments. None delivers an operational system in which predictions are explained, monitored continuously and tracked to resolution.",
    { x: 0.6, y: 6.35, w: 12.1, h: 0.5, fontFace: F, fontSize: 13, bold: true, color: INDIGO, lineSpacing: 18, margin: 0 });
  chrome(s, false);
  s.addNotes(
`Four papers. Give one line each — do not read the table.

Weber and colleagues, 2019 — this is my anchor paper. They created the Elliptic dataset I use, and they found Random Forest beat their graph model, at an F1 of about 0.79. That's the number I reproduce.

Alarab and colleagues, 2020 — improved the graph model's architecture on the same data.

Pareja and colleagues, 2020 — EvolveGCN, a graph model that changes over time to handle drift. I cite this in my future work.

Motie and Raahemi, 2024 — a systematic review confirming graph neural networks are competitive on relational fraud, and naming the open problems: imbalance, drift, explainability.

Then the punchline at the bottom: all four are model experiments. None of them builds a system an analyst can use. That's the gap I fill.`);
}


/* ═══ 8 — METHODOLOGY ═══════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Methodology", "Iterative and incremental development, with CRISP-DM for the machine learning");
  card(s, 0.6, 1.7, 5.45, 1.5);
  s.addText("ITERATION 1  ·  PaySim", { x: 0.9, y: 1.9, w: 4.9, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: MUTED, charSpacing: 1, margin: 0 });
  s.addText("Synthetic mobile-money data. Established the pipeline, but contained no transaction network to analyse — which prompted the change of dataset.",
    { x: 0.9, y: 2.23, w: 4.9, h: 0.8, fontFace: F, fontSize: 12, color: MUTED, lineSpacing: 16, margin: 0 });
  card(s, 6.35, 1.7, 5.45, 1.5, TINT);
  s.addText("ITERATION 2  ·  Elliptic", { x: 6.65, y: 1.9, w: 4.9, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: INDIGO, charSpacing: 1, margin: 0 });
  s.addText("Real Bitcoin transaction graph. The final system: both models, the analyst console, and the full evaluation.",
    { x: 6.65, y: 2.23, w: 4.9, h: 0.8, fontFace: F, fontSize: 12, color: TEXT, lineSpacing: 16, margin: 0 });
  s.addText("THE PIPELINE", { x: 0.6, y: 3.45, w: 3, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: MUTED, charSpacing: 1.2, margin: 0 });
  [{ t: "Explore", d: "Profile both\ndatasets" }, { t: "Prepare", d: "Encode labels,\ndrop identifiers" },
   { t: "Split", d: "Temporal:\ntrain 1–34" }, { t: "Balance", d: "SMOTE on the\ntraining set only" },
   { t: "Train", d: "Random Forest\n+ GraphSAGE" }, { t: "Evaluate", d: "Test on\nsteps 35–49" }].forEach((f, i) => {
    const x = 0.6 + i * 1.93;
    card(s, x, 3.85, 1.72, 1.5);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.14, y: 4.01, w: 0.36, h: 0.36, fill: { color: INDIGO } });
    s.addText(String(i + 1), { x: x + 0.14, y: 4.01, w: 0.36, h: 0.36, align: "center", valign: "middle", fontFace: F, fontSize: 12, bold: true, color: WHITE, margin: 0 });
    s.addText(f.t, { x: x + 0.14, y: 4.45, w: 1.45, h: 0.28, fontFace: F, fontSize: 13, bold: true, color: TEXT, margin: 0 });
    s.addText(f.d, { x: x + 0.14, y: 4.75, w: 1.45, h: 0.5, fontFace: F, fontSize: 10, color: MUTED, lineSpacing: 12.5, margin: 0 });
    if (i < 5) s.addShape(pres.ShapeType.rect, { x: x + 1.76, y: 4.57, w: 0.13, h: 0.035, fill: { color: LINE } });
  });
  card(s, 0.6, 5.63, 11.2, 1.05, TINT);
  s.addText([{ text: "Why split by time?  ", options: { bold: true, color: INDIGO } },
    { text: "A random split would put transactions from the same period — and even direct neighbours in the graph — on both sides, letting information leak from test into training. Training on the past and testing on the future is also how the system would actually be deployed.", options: { color: TEXT } }],
    { x: 0.95, y: 5.8, w: 10.5, h: 0.75, fontFace: F, fontSize: 12.5, lineSpacing: 17, margin: 0 });
  chrome(s, false);
  s.addNotes(
`If asked "what methodology did you use", the answer is: the iterative and incremental model of the software development life cycle, with CRISP-DM for the machine learning component.

The project ran in two complete iterations. The first used PaySim, synthetic mobile-money data. It got the pipeline working, but PaySim has no network of connections between transactions, so the graph analysis at the heart of my project couldn't be done on it. With my supervisor's approval I moved to Elliptic, real Bitcoin data, for the final system.

Why iterative and not waterfall? Because waterfall assumes your requirements are fixed at the start. Mine weren't — I only discovered the dataset problem after building on it. The iterative model let each cycle produce something working that I could evaluate before committing to the next.

Then walk the six pipeline steps quickly.

Finish on the box at the bottom. Training on the past and testing on the future avoids data leakage, and it's how a real deployed system works. This is the same protocol as the benchmark paper, which is why my results are comparable to theirs.`);
}


/* ═══ 9 — SYSTEM ARCHITECTURE ═══════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "System Architecture", "Three tiers: React console, Flask REST API, MySQL and the trained models");
  s.addImage({ path: shot("fig-architecture.png"), x: 1.05, y: 1.62, w: 11.2, h: 5.12 });
  s.addText("Every request carries a JSON Web Token; role checks are enforced on the server, so an analyst cannot reach administrator routes. Validated by 35 automated tests, all passing.",
    { x: 1.05, y: 6.82, w: 11.2, h: 0.35, fontFace: F, fontSize: 11, italic: true, color: MUTED, margin: 0 });
  chrome(s, false);
  s.addNotes(
`This is the architecture. Three tiers, top to bottom.

The presentation tier, in blue, is the React console — the landing and login pages, the analyst pages, and the administrator pages.

The application tier, in green, is the Flask REST API. It is organised into six blueprints: auth, transactions, predictions, monitor, reports and admin. Every request from the browser carries a token, and the role check happens on the server — so an analyst cannot reach an administrator route even by typing the URL directly.

The data tier, in yellow, is MySQL holding eight tables — the transactions, the edges that make up the graph, the predictions and the alerts — plus the serialised model files.

Point at the two model files on the right. Random Forest runs live on every request. GraphSAGE scores come from a precomputed store, because running full-graph message passing on every request would be too slow on a laptop. That's a deliberate engineering trade-off, and I'll explain it if asked.

Why three tiers at all? So each layer can change without breaking the others — I could redesign the entire interface without touching the models.`);
}


/* ═══ 10 — IMPLEMENTATION: SCORING A TRANSACTION ═══════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Implementation", "Scoring a transaction");
  s.addImage({ path: shot("crop-readout.png"), x: 0.6, y: 1.6, w: 7.9, h: 4.5 });
  s.addText("Analyze Transaction — the analyst selects a real transaction and the system returns a verdict.",
    { x: 0.6, y: 6.2, w: 7.9, h: 0.35, fontFace: F, fontSize: 11, italic: true, color: MUTED, margin: 0 });
  note(s, 8.85, 1.7, 1, "Both models, side by side", "Random Forest says 91.0%, GraphSAGE says 99.9%. The analyst can switch between them.", 3.4);
  note(s, 8.85, 2.85, 2, "A risk score, not a yes/no", "The spectrum shows where this transaction sits between legitimate and fraudulent.", 3.4);
  note(s, 8.85, 4.0, 3, "Ground truth shown", "This one is a known illicit transaction, so the verdict can be checked. Most of the dataset has no label at all.", 3.4);
  note(s, 8.85, 5.35, 4, "The alert is automatic", "Crossing the high-confidence threshold opens a case in the analyst's queue with no manual step.", 3.4);
  chrome(s, false);
  s.addNotes(
`This is the core of the system. Walk through the screen.

The analyst picks a real transaction — this one is number 30179316, from time step 37, which is in the test period the models never trained on.

The system returns a fraud probability of 91 percent and flags it as illicit. The coloured bar is the risk spectrum: blue is legitimate, red is fraudulent.

Underneath you can see both models — Random Forest 91 percent, GraphSAGE 99.9 percent. The analyst can toggle between them.

Ground truth says illicit, so on this one we can confirm the system is right.

And the orange box: because the score crossed the alert threshold, the system opened a case automatically. Nobody clicked anything to make that happen.

If asked why you can't type in your own transaction: the features are anonymised, and a made-up transaction has no position in the real network. In deployment the transactions would arrive from a live feed.`);
}


/* ═══ 11 — IMPLEMENTATION: EXPLAINABILITY AND NETWORK ═══════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Implementation", "Why the score came out that way, and where the transaction sits");
  s.addImage({ path: shot("crop-explain.png"), x: 0.6, y: 1.62, w: 7.0, h: 3.58 });
  s.addText("Explainability — every score broken down into the features that produced it",
    { x: 0.6, y: 5.28, w: 7.0, h: 0.3, fontFace: F, fontSize: 11, italic: true, color: MUTED, margin: 0 });
  s.addImage({ path: shot("crop-network.png"), x: 7.85, y: 1.62, w: 4.25, h: 4.16 });
  s.addText("The two-hop payment network around the transaction",
    { x: 7.85, y: 5.86, w: 4.25, h: 0.3, fontFace: F, fontSize: 11, italic: true, color: MUTED, margin: 0 });
  card(s, 0.6, 5.75, 7.0, 1.15, TINT);
  s.addText([{ text: "Red pushes toward illicit, blue toward legitimate. ", options: { bold: true, color: INDIGO } },
    { text: "Because Elliptic anonymises its feature names, contributions are grouped: how much came from the transaction itself versus its network neighbourhood. The parts sum exactly to the model's output.", options: { color: TEXT } }],
    { x: 0.85, y: 5.92, w: 6.5, h: 0.85, fontFace: F, fontSize: 11.5, lineSpacing: 15, margin: 0 });
  chrome(s, false);
  s.addNotes(
`Two things on this slide.

On the left, explainability. Every score is broken into the features that produced it. Red bars pushed the score toward illicit, blue toward legitimate. It starts from the model's neutral point of 50 percent, and you can see the transaction's own features added 31.8 points and its network features added 9.2.

Because Elliptic hides what the features mean, I report them by group rather than by name — the transaction's own information versus information about its neighbours. That's the most honest explanation the data allows.

If asked why not SHAP, the standard library: SHAP depends on a component that Windows security policy blocks on my machine, so I implemented the underlying method myself in NumPy, walking the decision trees directly. I wrote a test that asserts the parts sum exactly to the prediction, and they do.

On the right, the network view. The red dot in the middle is the transaction being analysed. The ring around it is its 177 direct counterparties, and the outer ring is transactions two hops away. Two hops specifically, because that's exactly what the graph model can see.

If asked why an illicit transaction has legitimate neighbours: that's what laundering is. Dirty money has to touch legitimate services to be cashed out, so those blue nodes are the exit points, not proof of innocence.`);
}


/* ═══ 12 — IMPLEMENTATION: CONTINUOUS MONITORING ═══════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Implementation", "Continuous monitoring, not just on-demand checks");
  s.addImage({ path: shot("05-live-monitor.png"), x: 0.6, y: 1.6, w: 7.9, h: 4.94 });
  s.addText("Live Monitor — the test period replayed as an arriving stream",
    { x: 0.6, y: 6.62, w: 7.9, h: 0.3, fontFace: F, fontSize: 11, italic: true, color: MUTED, margin: 0 });
  note(s, 8.85, 1.7, 1, "Every transaction is screened", "Each time step arrives as a batch and is scored automatically. No analyst has to press anything.", 3.4);
  note(s, 8.85, 2.95, 2, "Only high-confidence crossings alert", "Random Forest at 0.9, GraphSAGE at 0.99 — the GNN's bar is higher because its scores run overconfident.", 3.4);
  note(s, 8.85, 4.3, 3, "An alert budget", "Only the top 25 by score become cases each step, modelling how many an analyst team can actually review.", 3.4);
  note(s, 8.85, 5.55, 4, "Data the models never saw", "The replay covers time steps 35 to 49 — the held-out test period.", 3.4);
  chrome(s, false);
  s.addNotes(
`This is what makes it a monitoring system rather than a lookup tool.

The Live Monitor replays the test period as if transactions were arriving live. Each step is a batch of a few thousand transactions, and every single one is scored automatically. Nobody clicks anything.

Look at the screening log. Step 35: 5,507 transactions screened, 374 crossed a threshold, 25 alerts raised.

Why only 25? That's the alert budget. Hundreds crossing a threshold is realistic, but no analyst team can review hundreds of cases per period. So the system ranks them and raises the top 25. That's a real concept from fraud operations. Everything else is still counted and recorded.

If asked whether this is real-time: no, it replays the dataset's own timeline. But the screening logic is identical to what a live system would do — in production you'd swap the replay for a live blockchain feed. That's in my future work.

Important point to make: these are transactions the models never saw during training. From the model's point of view, every one of them is brand new.`);
}


/* ═══ 13 — SUMMARY OF THE WORK: DATA AND MODELS ═════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Summary of the Work", "The data and the three models");
  card(s, 0.6, 1.68, 5.45, 4.9);
  s.addText("THE ELLIPTIC DATASET", { x: 0.9, y: 1.9, w: 4.9, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: INDIGO, charSpacing: 1.2, margin: 0 });
  s.addText("A labelled subgraph of the real Bitcoin blockchain, published by Elliptic Ltd. with the MIT-IBM Watson AI Lab.",
    { x: 0.9, y: 2.25, w: 4.9, h: 0.6, fontFace: F, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0 });
  [["203,769", "transactions (nodes)"], ["234,355", "payment flows (edges)"], ["165", "features per transaction"],
   ["49", "time steps of ~2 weeks"], ["46,564", "labelled — 9.76% illicit"]].forEach((f, i) => {
    const y = 3.0 + i * 0.66;
    s.addText(f[0], { x: 0.9, y, w: 1.7, h: 0.35, fontFace: F, fontSize: 18, bold: true, color: TEXT, margin: 0 });
    s.addText(f[1], { x: 2.65, y: y + 0.07, w: 3.2, h: 0.3, fontFace: F, fontSize: 12, color: MUTED, margin: 0 });
  });
  s.addText("77% of transactions carry no label — the models score them, but no ground truth exists.",
    { x: 0.9, y: 6.08, w: 4.9, h: 0.35, fontFace: F, fontSize: 11, italic: true, color: AMBER, lineSpacing: 14, margin: 0 });
  card(s, 6.35, 1.68, 5.45, 4.9);
  s.addText("THE MODELS", { x: 6.65, y: 1.9, w: 4.9, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: INDIGO, charSpacing: 1.2, margin: 0 });
  [{ t: "Random Forest", d: "200 decision trees voting on the transaction's own 165 features.", c: INDIGO },
   { t: "GraphSAGE", d: "Two message-passing layers, hidden dimension 128. Learns from each transaction's two-hop neighbourhood in the payment graph.", c: AMBER },
   { t: "Combined variant", d: "Random Forest trained on the features plus the GraphSAGE embeddings.", c: RED }].forEach((m, i) => {
    const y = 2.3 + i * 1.15;
    s.addShape(pres.ShapeType.ellipse, { x: 6.65, y: y + 0.07, w: 0.22, h: 0.22, fill: { color: m.c } });
    s.addText(m.t, { x: 7.02, y, w: 4.5, h: 0.3, fontFace: F, fontSize: 14.5, bold: true, color: TEXT, margin: 0 });
    s.addText(m.d, { x: 7.02, y: y + 0.33, w: 4.5, h: 0.75, fontFace: F, fontSize: 11.5, color: MUTED, lineSpacing: 15, margin: 0 });
  });
  card(s, 6.65, 5.75, 4.85, 0.62, TINT);
  s.addText("Trained on time steps 1–34  ·  tested on 35–49", { x: 6.85, y: 5.9, w: 4.5, h: 0.35, fontFace: F, fontSize: 12.5, bold: true, color: INDIGO, margin: 0 });
  chrome(s, false);
  s.addNotes(
`The dataset first. Elliptic is a real slice of the Bitcoin blockchain, released by a blockchain forensics company with MIT and IBM. Roughly 204,000 transactions connected by 234,000 payment flows.

Two things to stress. First — each node is a transaction, not an account. That's how Bitcoin works: money flows transaction to transaction. Second — only 23 percent carry a label. 77 percent are unknown, so I train and test on the 46,564 that are labelled.

Then the models. Random Forest is 200 decision trees voting on the transaction's own features. GraphSAGE looks at the network — each transaction's neighbours, and its neighbours' neighbours. The third combines them.

Finally the split at the bottom — trained on the earlier time steps, tested on the later ones. You covered this on the methodology slide; just remind them here.

If asked why 165 features and not 166: I excluded the time step from training because I use it only to split the data. Leaving it in would let the model learn period-specific artefacts instead of fraud.`);
}


/* ═══ 14 — SUMMARY OF THE WORK: RESULTS ═════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  heading(s, "Summary of the Work", "Results on the held-out test period (time steps 35–49)");
  s.addChart(pres.ChartType.bar, [{ name: "Illicit-class F1", labels: ["Random Forest", "RF + GNN embeddings", "GraphSAGE"], values: [0.807, 0.707, 0.697] }], {
    x: 0.6, y: 1.7, w: 6.6, h: 3.5, barDir: "bar", chartColors: [INDIGO, RED, AMBER], varyColors: true,
    showTitle: true, title: "Illicit-class F1 score", titleFontFace: F, titleFontSize: 14, titleColor: TEXT,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontFace: F, dataLabelFontSize: 12, dataLabelColor: TEXT, dataLabelFormatCode: "0.000",
    catAxisLabelFontFace: F, catAxisLabelFontSize: 11, catAxisLabelColor: MUTED,
    valAxisLabelFontFace: F, valAxisLabelFontSize: 10, valAxisLabelColor: MUTED,
    valAxisMaxVal: 1, valGridLine: { color: LINE, size: 1 }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 55,
  });
  [{ v: "92.5%", l: "Precision", c: INDIGO }, { v: "71.6%", l: "Recall", c: AMBER }, { v: "0.944", l: "AUC-ROC", c: INDIGO }].forEach((k, i) => {
    const x = 7.5 + (i % 2) * 2.35, y = 1.9 + Math.floor(i / 2) * 1.35;
    card(s, x, y, 2.2, 1.15);
    s.addText(k.v, { x: x + 0.18, y: y + 0.16, w: 1.9, h: 0.5, fontFace: F, fontSize: 24, bold: true, color: k.c, margin: 0 });
    s.addText(k.l, { x: x + 0.18, y: y + 0.7, w: 1.9, h: 0.3, fontFace: F, fontSize: 11.5, color: MUTED, margin: 0 });
  });
  s.addText("Best model:\nRandom Forest", { x: 10.05, y: 3.4, w: 2.2, h: 0.9, fontFace: F, fontSize: 13, bold: true, color: TEXT, lineSpacing: 17, margin: 0 });
  card(s, 7.5, 4.75, 4.75, 1.5, TINT);
  s.addText("Benchmark reproduced", { x: 7.75, y: 4.95, w: 4.3, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: INDIGO, margin: 0 });
  s.addText("Weber et al. (2019) report an illicit F1 of ≈0.79 for Random Forest under the same dataset and temporal protocol. This project reached 0.807.",
    { x: 7.75, y: 5.28, w: 4.3, h: 0.85, fontFace: F, fontSize: 11.5, color: TEXT, lineSpacing: 15, margin: 0 });
  s.addText("Of 1,083 illicit transactions in the test period the Random Forest caught 776 and raised only 65 false alarms across 15,587 legitimate transactions. The recall shortfall coincides with a dark-market shutdown inside the test window — a documented case of concept drift.",
    { x: 0.6, y: 5.5, w: 6.6, h: 1.05, fontFace: F, fontSize: 12, color: MUTED, lineSpacing: 17, margin: 0 });
  chrome(s, false);
  s.addNotes(
`This is the most important slide. Know these numbers cold.

Random Forest won with an F1 of 0.807. GraphSAGE got 0.697, the combined variant 0.707.

Precision 92.5 percent means when the system raises an alarm, it's right about 9 times out of 10. Recall 71.6 percent means it catches about 7 out of every 10 illicit transactions.

Now the key sentence: Weber and colleagues published about 0.79 on this exact dataset with this exact protocol. I got 0.807. I reproduced a peer-reviewed result. Say that clearly.

If asked why recall is only 71.6 percent — a dark-web marketplace was shut down at time step 43, inside my test period. That changed how criminals behaved, and my model was trained on the earlier behaviour. The dataset's own authors report the same drop. It's called concept drift, and it's why real systems have to be retrained.

If asked why not just use accuracy — only 2 percent of transactions are illicit, so a model that says "nothing is fraud" would be 98 percent accurate and catch nothing.`);
}


/* ═══ 15 — CONCLUSION ═══════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("Conclusion", { x: 0.6, y: 0.55, w: 8, h: 0.7, fontFace: F, fontSize: 32, bold: true, color: WHITE, margin: 0 });
  [{ t: "The system works, and the result is verifiable", d: "An illicit-class F1 of 0.807 on transactions the models had never seen, reproducing the benchmark published for this dataset." },
   { t: "Feature engineering and graph learning are complements", d: "The Random Forest wins here because Elliptic's features already summarise each transaction's neighbours — and because the graph itself is sparse, at a mean of 2.3 connections per transaction." },
   { t: "Detection only matters when it reaches an analyst", d: "Every prediction is explained, every high-confidence detection becomes a tracked case, and the transaction stream is screened continuously under a realistic capacity budget." }].forEach((p, i) => {
    const y = 1.55 + i * 1.5;
    s.addShape(pres.ShapeType.ellipse, { x: 0.6, y: y + 0.1, w: 0.4, h: 0.4, fill: { color: INDIGO } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.1, w: 0.4, h: 0.4, align: "center", valign: "middle", fontFace: F, fontSize: 13, bold: true, color: WHITE, margin: 0 });
    s.addText(p.t, { x: 1.25, y, w: 10.5, h: 0.35, fontFace: F, fontSize: 17, bold: true, color: WHITE, margin: 0 });
    s.addText(p.d, { x: 1.25, y: y + 0.4, w: 10.5, h: 0.85, fontFace: F, fontSize: 13, color: "9AA6C4", lineSpacing: 18, margin: 0 });
  });
  s.addShape(pres.ShapeType.rect, { x: 0.6, y: 6.2, w: 2.6, h: 0.065, fill: { color: INDIGO } });
  s.addShape(pres.ShapeType.rect, { x: 3.2, y: 6.2, w: 1.5, h: 0.065, fill: { color: AMBER } });
  s.addShape(pres.ShapeType.rect, { x: 4.7, y: 6.2, w: 1.0, h: 0.065, fill: { color: RED } });
  s.addText("Thank you.", { x: 0.6, y: 6.5, w: 6, h: 0.5, fontFace: F, fontSize: 20, bold: true, color: WHITE, margin: 0 });
  chrome(s, true);
  s.addNotes(
`Three closing points, then stop talking.

One — it works and it's checkable. F1 of 0.807 on data the models never saw, reproducing a published benchmark.

Two — the honest finding. Random Forest beat the graph model. Not because graph learning doesn't work, but because this dataset's features already contain summaries of each transaction's neighbours, and because the graph is thin — an average of only 2.3 connections per transaction. Say this before anyone asks; it shows you understand your own result.

Three — the wider point. A model nobody can reach detects nothing. Explanations, continuous monitoring and case management are what turn a classifier into a system.

Then: thank you, and I'm happy to take questions.

LIKELY QUESTIONS — short answers:
· Limitations? Anonymised features, only 23% labelled, concept drift in the test window, Bitcoin-specific, local deployment.
· Future work? Probability calibration, threshold tuning, a temporal graph model like EvolveGCN, a graph database, live ingestion.
· Did you use AI? For parts of the coding, like documentation or Stack Overflow. The design decisions were mine and I can explain every part of how it works.`);
}


pres.writeFile({ fileName: OUT }).then(() => console.log(`Wrote ${n} slides -> ${OUT}`));
