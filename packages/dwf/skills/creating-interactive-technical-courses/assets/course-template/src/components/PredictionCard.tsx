import { useState } from 'react';

type PredictionCardProps = {
  question: string;
  options: { label: string; explanation: string; correct: boolean }[];
};

export function PredictionCard({ question, options }: PredictionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="prediction" aria-labelledby="prediction-question">
      <h3 id="prediction-question">{question}</h3>
      <div className="prediction-options">
        {options.map((option, index) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div
          className={
            options[selected].correct ? 'feedback is-correct' : 'feedback'
          }
          aria-live="polite"
        >
          <strong>{options[selected].correct ? 'Yes.' : 'Not quite.'}</strong>{' '}
          {options[selected].explanation}
        </div>
      )}
    </section>
  );
}
