import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router';
import { course } from './course/course';
import { PredictionCard } from './components/PredictionCard';
import { SystemModel } from './components/SystemModel';

function Overview() {
  return (
    <main data-course-ready="true" className="course-shell">
      <p className="eyebrow">Interactive technical mini-course</p>
      <h1>{course.title}</h1>
      <p className="lede">
        Starter content only. Replace this with the Course Brief-driven learning
        experience.
      </p>
      <div className="meta-row">
        <span>{course.audience}</span>
        <span>~{course.estimatedMinutes} min starter</span>
      </div>
      <SystemModel />
      <h2>Target capabilities</h2>
      <ul>
        {course.capabilities.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Link className="primary-link" to="/lesson">
        Start starter lesson
      </Link>
    </main>
  );
}

function Lesson() {
  const [active, setActive] = useState<'client' | 'service' | 'store'>(
    'client',
  );
  return (
    <main data-course-ready="true" className="course-shell">
      <Link to="/">← Overview</Link>
      <p className="eyebrow">Starter lesson</p>
      <h1>Use one stable model</h1>
      <p className="lede">
        Select the component currently doing work. The whole-system
        representation remains stable while attention changes.
      </p>
      <div className="control-row" aria-label="Highlight component">
        {(['client', 'service', 'store'] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={active === id}
            onClick={() => setActive(id)}
          >
            {id}
          </button>
        ))}
      </div>
      <SystemModel active={active} />
      <PredictionCard
        question="Which component should own the durable business state in this starter model?"
        options={[
          {
            label: 'Client',
            correct: false,
            explanation:
              'In this intentionally simple model, the client initiates work but is not the durable authority.',
          },
          {
            label: 'Service',
            correct: false,
            explanation:
              'The service owns orchestration, but durable persistence is represented by the store.',
          },
          {
            label: 'Store',
            correct: true,
            explanation:
              'The store is the durable state holder in this starter representation.',
          },
        ]}
      />
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="/lesson" element={<Lesson />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
