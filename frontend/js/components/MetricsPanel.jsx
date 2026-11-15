//таблиця метрик якості
//props:
//result - відповідь сервера після обробки (або null, якщо обробки ще не було)
function MetricRow(props) {
  let text = showNumber(props.value);
  let className = '';

  if (props.value === null && props.needsGt && !props.hasGt) {
    text = 'потрібен еталон';
    className = 'missing';
  }

  return (
    <tr>
      <td>{props.label}</td>
      <td className={className}>{text}</td>
    </tr>
  );
}

function MetricsPanel(props) {
  const result = props.result;

  if (result === null) {
    return (
      <section className="panel">
        <h2>Метрики</h2>
        <p className="hint">Оберіть метод і натисніть «Застосувати».</p>
      </section>
    );
  }

  const m = result.metrics;
  const hasGt = result.has_gt;

  return (
    <section className="panel">
      <h2>Метрики</h2>
      <table>
        <tbody>
          <MetricRow label="MSE" value={m.mse} />
          <MetricRow label="PSNR" value={m.psnr} />
          <MetricRow label="SSIM" value={m.ssim} />
          <MetricRow label="FOM" value={m.fom} needsGt={true} hasGt={hasGt} />
          <MetricRow label="AUC-ROC" value={m.auc_roc} needsGt={true} hasGt={hasGt} />
        </tbody>
      </table>

      {result.resized && (
        <p className="hint">
          Знімок зменшено до {result.width}×{result.height} (оригінал {result.original_width}×{result.original_height});
          метрики пораховано для зменшеної версії.
        </p>
      )}
    </section>
  );
}