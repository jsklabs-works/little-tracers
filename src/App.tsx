import { useState } from "react";
import { Colouring } from "./Colouring";
import { PatternPractice } from "./PatternPractice";
import { TraceLetters } from "./TraceLetters";

const TABS = [
  { id: "letters", label: "Letters & numbers" },
  { id: "lines", label: "Lines & shapes" },
  { id: "colour", label: "Colouring" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function App() {
  const [tab, setTab] = useState<TabId>("letters");

  return (
    <main className="page">
      <header className="page-header">
        <h1>Little Tracers</h1>
        <p className="subtitle">Trace letters, lines and shapes, colour pictures, or print the same pages for pencil and crayon practice.</p>
        <div className="mode-toggle" role="tablist" aria-label="Activity">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? "mode-tab active" : "mode-tab"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {tab === "letters" && <TraceLetters />}
      {tab === "lines" && <PatternPractice />}
      {tab === "colour" && <Colouring />}
    </main>
  );
}
