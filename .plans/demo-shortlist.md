# Presentation Demo Shortlist
Generated from the live database + models. Search these IDs in the Analyze page.

## 1. Illicit hubs — the "wow" graphs (big red networks)
Known-illicit transactions with the most connections. Great for showing the subgraph view.
| tx_id | label | step | neighbours | RF score | GNN score |
|---|---|---|---|---|---|
| `30179316` | illicit | 37 | 177 | 91.0% | 99.9% |
| `269905668` | illicit | 25 | 173 | 100.0% | 99.8% |
| `96365231` | illicit | 33 | 166 | 96.5% | 100.0% |
| `99675435` | illicit | 21 | 158 | 100.0% | 99.9% |
| `355110272` | illicit | 32 | 153 | 98.5% | 99.8% |

## 2. Unknowns the model flags — genuine live predictions
Label is `unknown` (no ground truth exists anywhere). The model still flags them.
Say: "no one knows the answer here — this is real inference."
| tx_id | label | step | neighbours | RF score | GNN score |
|---|---|---|---|---|---|
| `372825885` | unknown | 22 | 78 | 99.5% | 99.9% |
| `373110164` | unknown | 22 | 75 | 99.5% | 100.0% |
| `372551893` | unknown | 22 | 69 | 96.5% | 99.5% |
| `197480855` | unknown | 44 | 54 | 95.5% | 88.9% |
| `372881147` | unknown | 22 | 70 | 95.0% | 99.7% |

## 3. RF vs GNN disagreements on unknowns — proof the graph matters
Same transaction, two very different scores. The gap IS the network's contribution.
| tx_id | label | step | neighbours | RF score | GNN score |
|---|---|---|---|---|---|
| `209123919` | unknown | 20 | 5 | 0.5% | 97.1% |
| `198800744` | unknown | 36 | 5 | 9.0% | 97.3% |
| `191382898` | unknown | 8 | 16 | 11.5% | 98.9% |
| `28443663` | unknown | 25 | 6 | 2.5% | 88.6% |
| `28910861` | unknown | 37 | 5 | 13.0% | 98.3% |

## 4. Licit hubs — busy but clean (control case)
High connectivity alone is not suspicious; the model clears these.
| tx_id | label | step | neighbours | RF score | GNN score |
|---|---|---|---|---|---|
| `2984918` | licit | 22 | 473 | 0.0% | 0.0% |
| `89273` | licit | 1 | 289 | 0.0% | 0.0% |
| `43388675` | licit | 10 | 284 | 0.0% | 0.0% |
