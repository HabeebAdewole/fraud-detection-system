import { useEffect, useState } from "react";
import { transactionApi, predictionApi } from "../services/api";
import Layout from "../components/shared/Layout";
import RiskMeter from "../components/shared/RiskMeter";
import SubgraphView from "../components/shared/SubgraphView";
import { ContributionBars } from "../components/shared/charts";

const LABEL_PILL = { illicit: "pill-red", licit: "pill-cyan", unknown: "pill-muted" };

export default function PredictTransaction() {
  const [filter, setFilter] = useState("illicit");
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(true);

  const [selected, setSelected] = useState(null);
  const [model, setModel] = useState("rf");
  const [result, setResult] = useState(null);
  const [subgraph, setSubgraph] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState("");

  function loadList() {
    setLoadingList(true);
    transactionApi.list({ label: filter === "all" ? "" : filter, q: search.trim() })
      .then((d) => { setList(d.transactions); setTotal(d.total); })
      .finally(() => setLoadingList(false));
  }
  useEffect(() => { loadList(); /* eslint-disable-next-line */ }, [filter]);

  async function analyze(tx, useModel = model) {
    setSelected(tx);
    setScoring(true);
    setError("");
    setResult(null);
    try {
      const [pred, sg] = await Promise.all([
        predictionApi.submit({ tx_id: tx.tx_id, model: useModel }),
        transactionApi.subgraph(tx.tx_id),
      ]);
      setResult(pred);
      setSubgraph(sg);
      // XAI is supplementary — fetch after the verdict, tolerate failure
      setExplanation(null);
      predictionApi.explain(tx.tx_id).then(setExplanation).catch(() => {});
    } catch (err) {
      setError(err.message || "Scoring failed");
    } finally {
      setScoring(false);
    }
  }

  function switchModel(m) {
    setModel(m);
    if (selected) analyze(selected, m);
  }

  const Tab = ({ id, label }) => (
    <button onClick={() => setFilter(id)}
      className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1.5 rounded-md transition-colors ${
        filter === id ? "bg-cyan/12 text-cyan" : "text-muted hover:text-text"}`}>
      {label}
    </button>
  );

  const isFraud = result?.prediction?.predicted_class === 1;

  return (
    <Layout eyebrow="Operations" title="Analyze Transaction">
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Browser */}
        <div className="panel overflow-hidden">
          <div className="p-4 border-b border-line">
            <p className="eyebrow mb-2">Browse the network · {total.toLocaleString()} txns</p>
            <div className="flex gap-2 mb-3">
              <input
                className="input flex-1" placeholder="Search by tx ID…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadList()}
              />
              <button className="btn-ghost !px-3" onClick={loadList}>Go</button>
            </div>
            <div className="flex gap-1">
              <Tab id="illicit" label="Illicit" />
              <Tab id="licit" label="Licit" />
              <Tab id="unknown" label="Unknown" />
              <Tab id="all" label="All" />
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto">
            {loadingList ? (
              <p className="p-5 text-muted font-mono text-sm">Loading…</p>
            ) : list.length === 0 ? (
              <p className="p-5 text-muted text-sm">No transactions match.</p>
            ) : (
              list.map((tx) => (
                <button
                  key={tx.tx_id}
                  onClick={() => analyze(tx)}
                  className={`w-full text-left px-4 py-3 border-b border-line-soft flex items-center justify-between gap-2 transition-colors ${
                    selected?.tx_id === tx.tx_id ? "bg-cyan/10" : "hover:bg-panel-2/60"}`}
                >
                  <div>
                    <p className="font-mono text-sm">{tx.tx_id}</p>
                    <p className="font-mono text-[11px] text-muted">step {tx.time_step}</p>
                  </div>
                  <span className={LABEL_PILL[tx.label]}>{tx.label}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Readout */}
        <div className="space-y-6">
          {!selected && (
            <div className="panel p-10 text-center">
              <p className="eyebrow mb-3">Select a transaction</p>
              <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                Pick a transaction from the network on the left. The model scores it and shows
                its position in the Bitcoin transaction graph — you analyse real transactions,
                you don't author them.
              </p>
            </div>
          )}

          {selected && (
            <>
              <div className="panel p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="eyebrow mb-1">Transaction</p>
                    <p className="font-mono text-lg">{selected.tx_id}</p>
                  </div>
                  {/* Model toggle */}
                  <div className="panel-2 inline-flex p-1">
                    {["rf", "gnn"].map((m) => (
                      <button key={m} onClick={() => switchModel(m)}
                        className={`font-mono text-[11px] uppercase px-3 py-1.5 rounded-md transition-colors ${
                          model === m ? "bg-cyan/15 text-cyan" : "text-muted hover:text-text"}`}>
                        {m === "rf" ? "Random Forest" : "GraphSAGE"}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="panel-2 border-red/30 bg-red/10 px-4 py-3 text-sm text-red mb-4">{error}</div>}

                {scoring ? (
                  <p className="text-muted font-mono text-sm py-8 text-center">Scoring…</p>
                ) : result && (
                  <>
                    <div className={`flex items-center gap-2 mb-5 ${isFraud ? "text-red" : "text-cyan"}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${isFraud ? "bg-red" : "bg-cyan"}`}
                        style={{ boxShadow: `0 0 10px ${isFraud ? "#E5484D" : "#2B44E8"}` }} />
                      <p className="font-display text-lg font-bold tracking-tight">
                        {isFraud ? "Flagged illicit" : "Cleared"}
                      </p>
                    </div>

                    <RiskMeter score={result.prediction.fraud_probability} />

                    <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2.5 font-mono text-[12px]">
                      <div className="flex justify-between"><dt className="text-muted">RF score</dt><dd className="text-text">{(result.scores.rf_probability * 100).toFixed(1)}%</dd></div>
                      <div className="flex justify-between"><dt className="text-muted">GNN score</dt><dd className="text-text">{(result.scores.gnn_probability * 100).toFixed(1)}%</dd></div>
                      <div className="flex justify-between"><dt className="text-muted">Model used</dt><dd className="text-text">{result.prediction.model_type}</dd></div>
                      <div className="flex justify-between">
                        <dt className="text-muted">Ground truth</dt>
                        <dd className={result.scores.true_label === "illicit" ? "text-red" : result.scores.true_label === "licit" ? "text-cyan" : "text-muted"}>
                          {result.scores.true_label}
                        </dd>
                      </div>
                    </dl>

                    {result.alert && (
                      <p className="mt-5 panel-2 border-amber/25 bg-amber/8 px-3 py-2.5 text-[12px] text-amber">
                        Open alert #{result.alert.alert_id} created — review under Alerts.
                      </p>
                    )}
                  </>
                )}
              </div>

              {explanation && !scoring && result && (
                <div className="panel p-6">
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="eyebrow">Explainability · Random Forest</p>
                    <span className="font-mono text-[10px] text-muted">{explanation.method}</span>
                  </div>
                  <h3 className="font-display font-bold tracking-tight mb-4">Why this score</h3>

                  {/* Group split — the graph-story headline */}
                  {(() => {
                    const g = explanation.group_totals;
                    const total = Math.abs(g.local) + Math.abs(g.aggregate);
                    const aggPct = total > 0 ? Math.round((Math.abs(g.aggregate) / total) * 100) : 0;
                    return (
                      <p className="text-[13px] text-muted leading-relaxed mb-4">
                        Starting from the base rate of {(explanation.base_value * 100).toFixed(0)}%,
                        the transaction's own features moved the score by{" "}
                        <span className="font-mono text-text">{g.local >= 0 ? "+" : ""}{(g.local * 100).toFixed(1)}pp</span>{" "}
                        and its network-neighbourhood features by{" "}
                        <span className="font-mono text-text">{g.aggregate >= 0 ? "+" : ""}{(g.aggregate * 100).toFixed(1)}pp</span>{" "}
                        — {aggPct}% of the decision's weight came from network context.
                      </p>
                    );
                  })()}

                  <ContributionBars contributions={explanation.contributions} />
                </div>
              )}

              {subgraph && !scoring && (
                <div className="panel p-6">
                  <SubgraphView data={subgraph} centerScore={result?.prediction?.fraud_probability ?? 0} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
