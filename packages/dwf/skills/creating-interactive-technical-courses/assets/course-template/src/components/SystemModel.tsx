type ModelProps = {
  active?: 'client' | 'service' | 'store';
};

export function SystemModel({ active }: ModelProps) {
  const node = (id: ModelProps['active'], x: number, label: string) => (
    <g className={active === id ? 'model-node is-active' : 'model-node'}>
      <rect x={x} y="52" width="150" height="72" rx="14" />
      <text x={x + 75} y="94" textAnchor="middle">
        {label}
      </text>
    </g>
  );

  return (
    <svg
      className="system-model"
      viewBox="0 0 640 180"
      role="img"
      aria-labelledby="system-title system-desc"
    >
      <title id="system-title">Starter system model</title>
      <desc id="system-desc">
        A client communicates with a service which persists state in a store.
      </desc>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <path className="model-edge" d="M 190 88 H 245" markerEnd="url(#arrow)" />
      <path className="model-edge" d="M 395 88 H 450" markerEnd="url(#arrow)" />
      {node('client', 40, 'Client')}
      {node('service', 245, 'Service')}
      {node('store', 450, 'Store')}
    </svg>
  );
}
