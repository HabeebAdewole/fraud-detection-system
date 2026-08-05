// Defence slide deck for Tracer. Run: node report/build_slides.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CREST = "C:\\Users\\brigh\\Downloads\\crescent logo.jpg";
const SHOTS = path.join(ROOT, "report", "screenshots");
const OUT = path.join(ROOT, "report", "Tracer_Defence_Slides.pptx");

// Palette taken from the system itself: indigo brand, risk amber/red.
const INK = "0B1220";       // dark slide background
const INDIGO = "2B44E8";    // primary accent
const AMBER = "E0870B";
const RED = "E5484D";
const TEXT = "0B0C0E";
const MUTED = "6B7280";
const LIGHT = "F6F6F4";
const WHITE = "FFFFFF";
const LINE = "E6E4E0";

const F = "Calibri";
const W = 13.3, H = 7.5;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Adewole Habeeb Adebola";
pres.title = "Machine Learning-Based Financial Fraud Detection System";

let pageNo = 0;

/** Every slide gets the crest and a page number. */
function chrome(slide, dark) {
  pageNo += 1;
  if (dark) {
    // white chip so the crest's own white background looks deliberate
    slide.addShape(pres.ShapeType.roundRect, {
      x: 12.08, y: 0.22, w: 0.99, h: 0.79, fill: { color: WHITE }, rectRadius: 0.06,
    });
  }
  slide.addImage({ path: CREST, x: 12.2, y: 0.32, w: 0.75, h: 0.587 });
  slide.addText(String(pageNo), {
    x: 12.2, y: 6.92, w: 0.75, h: 0.3, align: "right",
    fontFace: F, fontSize: 11, color: dark ? "8A93A6" : MUTED,
  });
}

function titleOf(slide, text) {
  slide.addText(text, {
    x: 0.6, y: 0.42, w: 11.3, h: 0.7,
    fontFace: F, fontSize: 32, bold: true, color: TEXT, margin: 0,
  });
}

/** Card with a subtle tint (no edge stripes). */
function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, fill: { color: fill || WHITE },
    line: { color: LINE, width: 1 }, rectRadius: 0.08,
    shadow: { type: "outer", angle: 90, blur: 8, offset: 1, color: "9AA0AA", opacity: 0.18 },
  });
}

/* ───────────────────────────── 1. TITLE ───────────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: INK };

  s.addText("MACHINE LEARNING-BASED FINANCIAL\nFRAUD DETECTION SYSTEM", {
    x: 0.9, y: 1.55, w: 11.0, h: 1.6,
    fontFace: F, fontSize: 38, bold: true, color: WHITE, lineSpacing: 44, margin: 0,
  });

  s.addText("Detecting illicit Bitcoin transactions with Random Forest and a Graph Neural Network", {
    x: 0.9, y: 3.2, w: 10.4, h: 0.4,
    fontFace: F, fontSize: 15, color: "9AA6C4", italic: true, margin: 0,
  });

  // risk spectrum motif, echoing the system's own risk meter
  s.addShape(pres.ShapeType.rect, { x: 0.9, y: 3.85, w: 2.6, h: 0.075, fill: { color: INDIGO } });
  s.addShape(pres.ShapeType.rect, { x: 3.5, y: 3.85, w: 1.5, h: 0.075, fill: { color: AMBER } });
  s.addShape(pres.ShapeType.rect, { x: 5.0, y: 3.85, w: 1.0, h: 0.075, fill: { color: RED } });

  s.addText([
    { text: "ADEWOLE HABEEB ADEBOLA\n", options: { fontSize: 17, bold: true, color: WHITE } },
    { text: "S122202011\n\n", options: { fontSize: 14, color: "9AA6C4" } },
    { text: "Supervisor:  Miss Saka B.A.", options: { fontSize: 14, color: "9AA6C4" } },
  ], { x: 0.9, y: 4.35, w: 6.5, h: 1.5, fontFace: F, margin: 0, lineSpacing: 22 });

  s.addText("Department of Computer Science\nCollege of Information and Communication Technology\nCrescent University, Abeokuta", {
    x: 0.9, y: 6.15, w: 8.0, h: 0.9,
    fontFace: F, fontSize: 11.5, color: "6E7A96", lineSpacing: 15, margin: 0,
  });

  chrome(s, true);
}

/* ────────────────────── 2. INTRODUCTION (1 of 2) ────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Introduction");
  s.addText("The scale of the problem", {
    x: 0.6, y: 1.12, w: 8, h: 0.3, fontFace: F, fontSize: 15, color: MUTED, margin: 0,
  });

  const stats = [
    { n: "2–5%", l: "of global GDP is laundered\nevery year (UNODC, 2011)", c: INDIGO },
    { n: "$154bn", l: "received by illicit crypto\naddresses in 2025 (Chainalysis)", c: AMBER },
    { n: "<1%", l: "of transactions are illicit —\nfinding them is the hard part", c: RED },
  ];
  stats.forEach((st, i) => {
    const x = 0.6 + i * 4.05;
    card(s, x, 1.75, 3.75, 1.95, WHITE);
    s.addText(st.n, { x: x + 0.28, y: 1.95, w: 3.2, h: 0.75, fontFace: F, fontSize: 40, bold: true, color: st.c, margin: 0 });
    s.addText(st.l, { x: x + 0.28, y: 2.78, w: 3.2, h: 0.8, fontFace: F, fontSize: 12.5, color: MUTED, lineSpacing: 16, margin: 0 });
  });

  s.addText([
    { text: "Money laundering", options: { bold: true } },
    { text: " is how criminal proceeds are disguised so they can be spent in the legitimate economy. Cryptocurrency has made this easier: value moves globally, quickly and pseudonymously, without a bank in the middle.", options: {} },
  ], { x: 0.6, y: 4.05, w: 11.2, h: 0.8, fontFace: F, fontSize: 15, color: TEXT, lineSpacing: 22, margin: 0 });

  s.addText([
    { text: "But the blockchain is also an opportunity. ", options: { bold: true, color: INDIGO } },
    { text: "Unlike banking data, which is locked inside private institutions, every Bitcoin transaction and every connection between transactions is permanently public — the complete transaction graph is available for analysis.", options: {} },
  ], { x: 0.6, y: 5.0, w: 11.2, h: 0.9, fontFace: F, fontSize: 15, color: TEXT, lineSpacing: 22, margin: 0 });

  chrome(s, false);
}

/* ────────────────────── 3. INTRODUCTION (2 of 2) ────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Introduction");
  s.addText("From rules, to machine learning, to the network", {
    x: 0.6, y: 1.12, w: 9, h: 0.3, fontFace: F, fontSize: 15, color: MUTED, margin: 0,
  });

  const steps = [
    { t: "Rule-based screening", d: "Hand-written conditions flag transactions above a threshold. Transparent, but brittle: it only catches what someone already thought of, floods analysts with false alarms, and criminals learn to structure activity just below the limits.", c: MUTED },
    { t: "Machine learning", d: "A classifier learns the signature of illicit activity from labelled history instead of fixed rules. Stronger, but the standard formulation judges each transaction alone.", c: AMBER },
    { t: "Graph-based learning", d: "Laundering is a network crime — funds are layered through chains of transfers so no single step looks unusual. A graph neural network reasons over those connections, not just the transaction's own attributes.", c: INDIGO },
  ];
  steps.forEach((st, i) => {
    const y = 1.72 + i * 1.62;
    s.addShape(pres.ShapeType.ellipse, { x: 0.6, y: y + 0.12, w: 0.5, h: 0.5, fill: { color: st.c } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.12, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F, fontSize: 16, bold: true, color: WHITE, margin: 0 });
    s.addText(st.t, { x: 1.35, y: y + 0.05, w: 10.4, h: 0.35, fontFace: F, fontSize: 17, bold: true, color: TEXT, margin: 0 });
    s.addText(st.d, { x: 1.35, y: y + 0.45, w: 10.4, h: 0.95, fontFace: F, fontSize: 13, color: MUTED, lineSpacing: 18, margin: 0 });
  });

  s.addText("This project builds Tracer: a system that scores real Bitcoin transactions with both approaches and delivers the results to a human analyst.", {
    x: 0.6, y: 6.55, w: 11.2, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: INDIGO, margin: 0,
  });

  chrome(s, false);
}

/* ───────────────────── 4. STATEMENT OF THE PROBLEM ───────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Statement of the Problem");

  const probs = [
    { h: "Volume defeats manual review", d: "Hundreds of thousands of Bitcoin transactions are recorded daily. No team of analysts can inspect them by hand." },
    { h: "Rules produce noise and are evaded", d: "Fixed thresholds generate large volumes of false alarms that consume analyst capacity, and adversaries structure activity to stay just below them." },
    { h: "Isolated-transaction models are blind to the crime", d: "Classifying each transaction on its own attributes discards the layering structure through which laundering is actually executed." },
  ];
  probs.forEach((p, i) => {
    const y = 1.3 + i * 1.42;
    card(s, 0.6, y, 11.2, 1.22, WHITE);
    s.addShape(pres.ShapeType.roundRect, { x: 0.9, y: y + 0.32, w: 0.42, h: 0.42, fill: { color: RED }, rectRadius: 0.06 });
    s.addText("!", { x: 0.9, y: y + 0.32, w: 0.42, h: 0.42, align: "center", valign: "middle", fontFace: F, fontSize: 18, bold: true, color: WHITE, margin: 0 });
    s.addText(p.h, { x: 1.55, y: y + 0.18, w: 10, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: TEXT, margin: 0 });
    s.addText(p.d, { x: 1.55, y: y + 0.56, w: 10, h: 0.55, fontFace: F, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0 });
  });

  card(s, 0.6, 5.62, 11.2, 1.15, "EEF1FE");
  s.addText([
    { text: "What is needed:  ", options: { bold: true, color: INDIGO } },
    { text: "a system that learns from data rather than fixed rules, incorporates the transaction network into its reasoning, screens every transaction automatically, and explains its decisions so analysts can act on them.", options: { color: TEXT } },
  ], { x: 0.95, y: 5.85, w: 10.5, h: 0.75, fontFace: F, fontSize: 14, lineSpacing: 20, margin: 0 });

  chrome(s, false);
}

/* ───────────────────────── 5. AIM AND OBJECTIVES ───────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Aim and Objectives");

  card(s, 0.6, 1.25, 11.2, 1.15, "EEF1FE");
  s.addText("AIM", { x: 0.95, y: 1.42, w: 1.5, h: 0.28, fontFace: F, fontSize: 11, bold: true, color: INDIGO, charSpacing: 1.5, margin: 0 });
  s.addText("To design and implement a machine learning-based financial fraud detection system that identifies illicit transactions in a real transaction network and supports analysts with automated screening, alerting and explainable results.", {
    x: 0.95, y: 1.72, w: 10.5, h: 0.6, fontFace: F, fontSize: 14.5, color: TEXT, lineSpacing: 20, margin: 0,
  });

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
    s.addText(o.t, { x: 1.3, y: y, w: 10.5, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: TEXT, margin: 0 });
    s.addText(o.d, { x: 1.3, y: y + 0.36, w: 10.5, h: 0.8, fontFace: F, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0 });
  });

  chrome(s, false);
}

/* ───────────────────── 6. SIGNIFICANCE OF THE STUDY ───────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Significance of the Study");

  const items = [
    { n: "01", t: "Demonstrates the production architecture", d: "Machine learning classification over a real transaction graph, combined with network analysis and delivered into an analyst's workflow — the same shape used by commercial platforms, built and validated at academic scale.", c: INDIGO },
    { n: "02", t: "Reproduces a published benchmark", d: "An empirical Random Forest versus GraphSAGE comparison on the Elliptic dataset under a leakage-free temporal protocol, matching the result reported by Weber et al. (2019).", c: AMBER },
    { n: "03", t: "Makes predictions explainable", d: "Regulators and investigators cannot act on scores they cannot interrogate. Every prediction is attributed to the feature groups that produced it.", c: RED },
    { n: "04", t: "Documents an honest methodology", d: "The move from synthetic data to a real transaction graph is recorded as it happened, as a realistic template for applied machine learning projects.", c: "4B5563" },
  ];
  items.forEach((it, i) => {
    const x = 0.6 + (i % 2) * 5.75;
    const y = 1.35 + Math.floor(i / 2) * 2.65;
    card(s, x, y, 5.45, 2.35, WHITE);
    s.addText(it.n, { x: x + 0.3, y: y + 0.22, w: 1, h: 0.4, fontFace: F, fontSize: 22, bold: true, color: it.c, margin: 0 });
    s.addText(it.t, { x: x + 0.3, y: y + 0.68, w: 4.85, h: 0.55, fontFace: F, fontSize: 15, bold: true, color: TEXT, lineSpacing: 19, margin: 0 });
    s.addText(it.d, { x: x + 0.3, y: y + 1.25, w: 4.85, h: 0.95, fontFace: F, fontSize: 11.5, color: MUTED, lineSpacing: 15, margin: 0 });
  });

  chrome(s, false);
}

/* ───────────────────────────── 7. RELATED WORKS ───────────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Related Works");

  const rows = [
    [
      { text: "Author(s)", options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12 } },
      { text: "Title", options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12 } },
      { text: "Key finding", options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12 } },
    ],
    [
      "Weber et al. (2019)",
      "Anti-Money Laundering in Bitcoin: Experimenting with Graph Convolutional Networks for Financial Forensics",
      "Introduced the Elliptic dataset. Random Forest was the strongest model at an illicit F1 of ≈0.79, ahead of the graph convolutional network.",
    ],
    [
      "Alarab, Prakoonwit & Nacer (2020)",
      "Competence of Graph Convolutional Networks for Anti-Money Laundering in Bitcoin Blockchain",
      "Interleaving graph convolutional and linear layers outperformed the original GCN configuration on the same dataset.",
    ],
    [
      "Pareja et al. (2020)",
      "EvolveGCN: Evolving Graph Convolutional Networks for Dynamic Graphs",
      "Using a recurrent network to evolve GCN weights across time steps beat the static GCN on evolving transaction graphs.",
    ],
    [
      "Motie & Raahemi (2024)",
      "Financial Fraud Detection Using Graph Neural Networks: A Systematic Review",
      "GNNs are consistently competitive with or superior to conventional baselines on relational fraud tasks; imbalance, drift and explainability remain open.",
    ],
  ];

  s.addTable(rows, {
    x: 0.6, y: 1.3, w: 12.1,
    colW: [2.3, 4.5, 5.3],
    fontFace: F, fontSize: 11.5, color: TEXT,
    border: { type: "solid", color: LINE, pt: 1 },
    align: "left", valign: "middle",
    rowH: [0.4, 1.05, 1.0, 0.95, 1.05],
    margin: 0.09,
  });

  s.addText("Common gap: these are model experiments. None delivers an operational system in which predictions are explained, monitored continuously and tracked to resolution.", {
    x: 0.6, y: 6.35, w: 12.1, h: 0.5, fontFace: F, fontSize: 13, bold: true, color: INDIGO, lineSpacing: 18, margin: 0,
  });

  chrome(s, false);
}

/* ──────────────── 8. SUMMARY OF THE WORK (1) — DATA & MODELS ──────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Summary of the Work");
  s.addText("The data and the three models", {
    x: 0.6, y: 1.12, w: 8, h: 0.3, fontFace: F, fontSize: 15, color: MUTED, margin: 0,
  });

  card(s, 0.6, 1.72, 5.45, 4.9, WHITE);
  s.addText("THE ELLIPTIC DATASET", { x: 0.9, y: 1.95, w: 4.9, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: INDIGO, charSpacing: 1.2, margin: 0 });
  s.addText("A labelled subgraph of the real Bitcoin blockchain, published by Elliptic Ltd. with the MIT-IBM Watson AI Lab.", {
    x: 0.9, y: 2.3, w: 4.9, h: 0.6, fontFace: F, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0,
  });
  const facts = [
    ["203,769", "transactions (nodes)"],
    ["234,355", "payment flows (edges)"],
    ["165", "features per transaction"],
    ["49", "time steps of ~2 weeks"],
    ["46,564", "labelled — 9.76% illicit"],
  ];
  facts.forEach((f, i) => {
    const y = 3.05 + i * 0.66;
    s.addText(f[0], { x: 0.9, y, w: 1.7, h: 0.35, fontFace: F, fontSize: 18, bold: true, color: TEXT, margin: 0 });
    s.addText(f[1], { x: 2.65, y: y + 0.07, w: 3.2, h: 0.3, fontFace: F, fontSize: 12, color: MUTED, margin: 0 });
  });
  s.addText("77% of transactions carry no label — the models score them, but no ground truth exists.", {
    x: 0.9, y: 6.15, w: 4.9, h: 0.35, fontFace: F, fontSize: 11, italic: true, color: AMBER, lineSpacing: 14, margin: 0,
  });

  card(s, 6.35, 1.72, 5.45, 4.9, WHITE);
  s.addText("THE MODELS", { x: 6.65, y: 1.95, w: 4.9, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: INDIGO, charSpacing: 1.2, margin: 0 });
  const models = [
    { t: "Random Forest", d: "200 decision trees voting on the transaction's own 165 features.", c: INDIGO },
    { t: "GraphSAGE", d: "Two message-passing layers, hidden dimension 128. Learns from each transaction's two-hop neighbourhood in the payment graph.", c: AMBER },
    { t: "Combined variant", d: "Random Forest trained on the features plus the GraphSAGE embeddings.", c: RED },
  ];
  models.forEach((m, i) => {
    const y = 2.35 + i * 1.15;
    s.addShape(pres.ShapeType.ellipse, { x: 6.65, y: y + 0.07, w: 0.22, h: 0.22, fill: { color: m.c } });
    s.addText(m.t, { x: 7.02, y: y, w: 4.5, h: 0.3, fontFace: F, fontSize: 14.5, bold: true, color: TEXT, margin: 0 });
    s.addText(m.d, { x: 7.02, y: y + 0.33, w: 4.5, h: 0.75, fontFace: F, fontSize: 11.5, color: MUTED, lineSpacing: 15, margin: 0 });
  });

  card(s, 6.65, 5.8, 4.85, 0.62, "EEF1FE");
  s.addText("Trained on time steps 1–34  ·  tested on 35–49", {
    x: 6.85, y: 5.95, w: 4.5, h: 0.35, fontFace: F, fontSize: 12.5, bold: true, color: INDIGO, margin: 0,
  });

  chrome(s, false);
}

/* ──────────────── 9. SUMMARY OF THE WORK (2) — RESULTS ──────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Summary of the Work");
  s.addText("Results on the held-out test period (time steps 35–49)", {
    x: 0.6, y: 1.12, w: 9, h: 0.3, fontFace: F, fontSize: 15, color: MUTED, margin: 0,
  });

  s.addChart(pres.ChartType.bar, [{
    name: "Illicit-class F1",
    labels: ["Random Forest", "RF + GNN embeddings", "GraphSAGE"],
    values: [0.807, 0.707, 0.697],
  }], {
    x: 0.6, y: 1.75, w: 6.6, h: 3.5,
    barDir: "bar", chartColors: [INDIGO, RED, AMBER], varyColors: true,
    showTitle: true, title: "Illicit-class F1 score", titleFontFace: F, titleFontSize: 14, titleColor: TEXT,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontFace: F, dataLabelFontSize: 12,
    dataLabelColor: TEXT, dataLabelFormatCode: "0.000",  // else PowerPoint rounds 0.807 to "1"
    catAxisLabelFontFace: F, catAxisLabelFontSize: 11, catAxisLabelColor: MUTED,
    valAxisLabelFontFace: F, valAxisLabelFontSize: 10, valAxisLabelColor: MUTED,
    valAxisMaxVal: 1, valGridLine: { color: LINE, size: 1 }, catGridLine: { style: "none" },
    showLegend: false, barGapWidthPct: 55,
  });

  const kpis = [
    { n: "92.5%", l: "Precision", c: INDIGO },
    { n: "71.6%", l: "Recall", c: AMBER },
    { n: "0.944", l: "AUC-ROC", c: INDIGO },
  ];
  kpis.forEach((k, i) => {
    const x = 7.5 + (i % 2) * 2.35;
    const y = 1.9 + Math.floor(i / 2) * 1.35;
    card(s, x, y, 2.2, 1.15, WHITE);
    s.addText(k.n, { x: x + 0.18, y: y + 0.16, w: 1.9, h: 0.5, fontFace: F, fontSize: 24, bold: true, color: k.c, margin: 0 });
    s.addText(k.l, { x: x + 0.18, y: y + 0.7, w: 1.9, h: 0.3, fontFace: F, fontSize: 11.5, color: MUTED, margin: 0 });
  });
  s.addText("Best model:\nRandom Forest", { x: 10.05, y: 3.4, w: 2.2, h: 0.9, fontFace: F, fontSize: 13, bold: true, color: TEXT, lineSpacing: 17, margin: 0 });

  card(s, 7.5, 4.75, 4.75, 1.5, "EEF1FE");
  s.addText("Benchmark reproduced", { x: 7.75, y: 4.95, w: 4.3, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: INDIGO, margin: 0 });
  s.addText("Weber et al. (2019) report an illicit F1 of ≈0.79 for Random Forest under the same dataset and temporal protocol. This project reached 0.807.", {
    x: 7.75, y: 5.28, w: 4.3, h: 0.85, fontFace: F, fontSize: 11.5, color: TEXT, lineSpacing: 15, margin: 0,
  });

  s.addText("Of 1,083 illicit transactions in the test period the Random Forest caught 776 and raised only 65 false alarms across 15,587 legitimate transactions. The recall shortfall coincides with a dark-market shutdown inside the test window — a documented case of concept drift.", {
    x: 0.6, y: 5.55, w: 6.6, h: 1.05, fontFace: F, fontSize: 12, color: MUTED, lineSpacing: 17, margin: 0,
  });

  chrome(s, false);
}

/* ───────────────────────────── 10. METHODOLOGY ───────────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Methodology");
  s.addText("Iterative and incremental development, with CRISP-DM for the machine learning", {
    x: 0.6, y: 1.12, w: 10, h: 0.3, fontFace: F, fontSize: 15, color: MUTED, margin: 0,
  });

  // two iterations
  card(s, 0.6, 1.75, 5.45, 1.5, WHITE);
  s.addText("ITERATION 1  ·  PaySim", { x: 0.9, y: 1.95, w: 4.9, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: MUTED, charSpacing: 1, margin: 0 });
  s.addText("Synthetic mobile-money data. Established the pipeline, but contained no transaction network to analyse — which prompted the change of dataset.", {
    x: 0.9, y: 2.28, w: 4.9, h: 0.8, fontFace: F, fontSize: 12, color: MUTED, lineSpacing: 16, margin: 0,
  });

  card(s, 6.35, 1.75, 5.45, 1.5, "EEF1FE");
  s.addText("ITERATION 2  ·  Elliptic", { x: 6.65, y: 1.95, w: 4.9, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: INDIGO, charSpacing: 1, margin: 0 });
  s.addText("Real Bitcoin transaction graph. The final system: both models, the analyst console, and the full evaluation.", {
    x: 6.65, y: 2.28, w: 4.9, h: 0.8, fontFace: F, fontSize: 12, color: TEXT, lineSpacing: 16, margin: 0,
  });

  // pipeline flow
  s.addText("THE PIPELINE", { x: 0.6, y: 3.5, w: 3, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: MUTED, charSpacing: 1.2, margin: 0 });

  const flow = [
    { t: "Explore", d: "Profile both\ndatasets" },
    { t: "Prepare", d: "Encode labels,\ndrop identifiers" },
    { t: "Split", d: "Temporal:\ntrain 1–34" },
    { t: "Balance", d: "SMOTE on the\ntraining set only" },
    { t: "Train", d: "Random Forest\n+ GraphSAGE" },
    { t: "Evaluate", d: "Test on\nsteps 35–49" },
  ];
  flow.forEach((f, i) => {
    const x = 0.6 + i * 1.93;
    card(s, x, 3.9, 1.72, 1.5, WHITE);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.14, y: 4.06, w: 0.36, h: 0.36, fill: { color: INDIGO } });
    s.addText(String(i + 1), { x: x + 0.14, y: 4.06, w: 0.36, h: 0.36, align: "center", valign: "middle", fontFace: F, fontSize: 12, bold: true, color: WHITE, margin: 0 });
    s.addText(f.t, { x: x + 0.14, y: 4.5, w: 1.45, h: 0.28, fontFace: F, fontSize: 13, bold: true, color: TEXT, margin: 0 });
    s.addText(f.d, { x: x + 0.14, y: 4.8, w: 1.45, h: 0.5, fontFace: F, fontSize: 10, color: MUTED, lineSpacing: 12.5, margin: 0 });
    if (i < flow.length - 1) {
      s.addShape(pres.ShapeType.rect, { x: x + 1.76, y: 4.62, w: 0.13, h: 0.035, fill: { color: LINE } });
    }
  });

  card(s, 0.6, 5.68, 11.2, 1.05, "EEF1FE");
  s.addText([
    { text: "Why split by time?  ", options: { bold: true, color: INDIGO } },
    { text: "A random split would put transactions from the same period — and even direct neighbours in the graph — on both sides, letting information leak from test into training. Training on the past and testing on the future is also how the system would actually be deployed.", options: { color: TEXT } },
  ], { x: 0.95, y: 5.85, w: 10.5, h: 0.75, fontFace: F, fontSize: 12.5, lineSpacing: 17, margin: 0 });

  chrome(s, false);
}

/* ──────────────────────────── 11. IMPLEMENTATION ──────────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleOf(s, "Implementation");
  s.addText("A three-tier analyst console:  React  ·  Flask REST API  ·  MySQL", {
    x: 0.6, y: 1.12, w: 10, h: 0.3, fontFace: F, fontSize: 15, color: MUTED, margin: 0,
  });

  s.addImage({ path: path.join(SHOTS, "04-analyze-full.png"), x: 0.6, y: 1.72, w: 6.35, h: 2.95 });
  s.addText("Analyze — risk score, both models, the two-hop payment network, and why the score came out that way", {
    x: 0.6, y: 4.75, w: 6.35, h: 0.45, fontFace: F, fontSize: 10.5, italic: true, color: MUTED, lineSpacing: 14, margin: 0,
  });

  s.addImage({ path: path.join(SHOTS, "05-live-monitor.png"), x: 0.6, y: 5.35, w: 6.35, h: 1.45 });
  s.addText("Live Monitor — screens every transaction per time step and raises alerts automatically",
    { x: 0.6, y: 6.85, w: 6.35, h: 0.3, fontFace: F, fontSize: 10.5, italic: true, color: MUTED, margin: 0 });

  const feats = [
    { t: "Role-based access", d: "Fraud Analyst and Administrator, enforced on the server." },
    { t: "Two-hop network view", d: "Shows exactly the neighbourhood the graph model reasons over." },
    { t: "Per-decision explanations", d: "Each score split into the transaction's own features versus its network context." },
    { t: "Continuous monitoring", d: "Automatic screening with an alert budget that models analyst capacity." },
    { t: "Case management", d: "Alerts carry notes through to resolution; activity exports as CSV." },
  ];
  feats.forEach((f, i) => {
    const y = 1.75 + i * 0.98;
    s.addShape(pres.ShapeType.ellipse, { x: 7.35, y: y + 0.08, w: 0.2, h: 0.2, fill: { color: INDIGO } });
    s.addText(f.t, { x: 7.7, y: y, w: 4.3, h: 0.3, fontFace: F, fontSize: 13.5, bold: true, color: TEXT, margin: 0 });
    s.addText(f.d, { x: 7.7, y: y + 0.31, w: 4.4, h: 0.6, fontFace: F, fontSize: 11, color: MUTED, lineSpacing: 14, margin: 0 });
  });

  card(s, 7.35, 6.6, 4.35, 0.6, "EEF1FE");
  s.addText("Validated by 35 automated tests, all passing", {
    x: 7.58, y: 6.74, w: 4.0, h: 0.32, fontFace: F, fontSize: 12, bold: true, color: INDIGO, margin: 0,
  });

  chrome(s, false);
}

/* ───────────────────────────── 12. CONCLUSION ───────────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: INK };

  s.addText("Conclusion", {
    x: 0.6, y: 0.55, w: 8, h: 0.7, fontFace: F, fontSize: 32, bold: true, color: WHITE, margin: 0,
  });

  const pts = [
    { t: "The system works, and the result is verifiable", d: "An illicit-class F1 of 0.807 on transactions the models had never seen, reproducing the benchmark published for this dataset." },
    { t: "Feature engineering and graph learning are complements", d: "The Random Forest wins here because Elliptic's features already summarise each transaction's neighbours — and because the graph itself is sparse, at a mean of 2.3 connections per transaction." },
    { t: "Detection only matters when it reaches an analyst", d: "Every prediction is explained, every high-confidence detection becomes a tracked case, and the transaction stream is screened continuously under a realistic capacity budget." },
  ];
  pts.forEach((p, i) => {
    const y = 1.55 + i * 1.5;
    s.addShape(pres.ShapeType.ellipse, { x: 0.6, y: y + 0.1, w: 0.4, h: 0.4, fill: { color: INDIGO } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.1, w: 0.4, h: 0.4, align: "center", valign: "middle", fontFace: F, fontSize: 13, bold: true, color: WHITE, margin: 0 });
    s.addText(p.t, { x: 1.25, y: y, w: 10.5, h: 0.35, fontFace: F, fontSize: 17, bold: true, color: WHITE, margin: 0 });
    s.addText(p.d, { x: 1.25, y: y + 0.4, w: 10.5, h: 0.85, fontFace: F, fontSize: 13, color: "9AA6C4", lineSpacing: 18, margin: 0 });
  });

  s.addShape(pres.ShapeType.rect, { x: 0.6, y: 6.2, w: 2.6, h: 0.065, fill: { color: INDIGO } });
  s.addShape(pres.ShapeType.rect, { x: 3.2, y: 6.2, w: 1.5, h: 0.065, fill: { color: AMBER } });
  s.addShape(pres.ShapeType.rect, { x: 4.7, y: 6.2, w: 1.0, h: 0.065, fill: { color: RED } });

  s.addText("Thank you.", {
    x: 0.6, y: 6.5, w: 6, h: 0.5, fontFace: F, fontSize: 20, bold: true, color: WHITE, margin: 0,
  });

  chrome(s, true);
}

pres.writeFile({ fileName: OUT }).then(() => {
  console.log(`Wrote ${pageNo} slides -> ${OUT}`);
});
