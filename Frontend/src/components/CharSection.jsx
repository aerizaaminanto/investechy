import "./chart.css";

export default function ChartSection({
  data = [],
  type = "admin",
  subtitle = "Statistics",
  title = "",
  yAxisLabels,
  compact = false,
}) {
  const maxRawValue = Math.max(
    ...data.map((item) => Number(item?.rawValue ?? item?.value ?? 0) || 0),
    0,
  );

  const roundedMaxValue = maxRawValue <= 0
    ? 5
    : Math.ceil(maxRawValue / 5) * 5;

  const defaultYAxisLabels = yAxisLabels || Array.from({ length: 6 }, (_, index) => {
    const stepIndex = 5 - index;
    return Math.round((roundedMaxValue / 5) * stepIndex).toString();
  });

  const labels = defaultYAxisLabels;
  const normalizedData = data.map((item) => {
    const rawValue = Number(item?.rawValue ?? item?.value ?? 0) || 0;
    const scaledHeight = roundedMaxValue > 0 ? (rawValue / roundedMaxValue) * 100 : 0;
    const visualHeight = rawValue > 0 ? Math.max(scaledHeight, 14) : 0;

    return {
      ...item,
      rawValue,
      visualHeight,
    };
  });

  return (
    <div className={`chart-container ${compact ? "compact" : ""}`}>
      <div className="chart-header">
        <span className="subtitle">{subtitle}</span>
        {title ? <h3 className="chart-title">{title}</h3> : null}
      </div>

      <div className="chart-content">
        <div className="y-axis">
          {labels.map((label, index) => <span key={index}>{label}</span>)}
        </div>

        <div className="chart-main">
          <div className="chart-grid">
            {[...Array(labels.length)].map((_, i) => <div key={i} className="grid-line"></div>)}
          </div>

          <div className={`chart-bars ${type === "admin" ? "chart-bars-admin" : ""}`}>
            {normalizedData.map((item, i) => (
              <div key={i} className={`bar-wrapper ${type === "admin" ? "bar-wrapper-admin" : ""}`}>
                <div className="bar-plot-area">
                  <div
                    className={`bar ${type === "admin" ? "bar-admin" : ""}`}
                    style={{ height: `${item.visualHeight}%` }}
                    title={`${item.label}: ${item.rawValue}`}
                    aria-label={`${item.label}: ${item.rawValue}`}
                    tabIndex={0}
                    data-value={item.rawValue}
                  ></div>
                </div>
                <span className="x-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
