import { Fragment } from "react";

interface FlowStep {
  label: string;
  note?: string;
  accent?: boolean;
}

export function FlowDiagram({
  connectors = [],
  steps,
}: {
  steps: readonly FlowStep[];
  connectors?: readonly string[];
}) {
  return (
    <div
      aria-label={steps.map((step) => step.label).join(" → ")}
      className="flow-diagram"
      role="img"
    >
      {steps.map((step, index) => (
        <Fragment key={step.label}>
          {index > 0 ? (
            <div aria-hidden="true" className="flow-connector">
              {connectors[index - 1] ? <span>{connectors[index - 1]}</span> : null}
              <svg
                aria-hidden="true"
                fill="none"
                viewBox="0 0 48 12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 6h42m0 0-6-4.5M42 6l-6 4.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          ) : null}
          <div className={step.accent ? "flow-node flow-node-accent" : "flow-node"}>
            <strong>{step.label}</strong>
            {step.note ? <span>{step.note}</span> : null}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
