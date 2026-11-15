//велике зображення з вкладками і кнопками для перемикання знімків
//props:
//item - поточний знімок
//view - яка вкладка відкрита: 'original', 'result' або 'pre'
//onView - функція: перемкнути вкладку
//index - номер поточного знімка (з нуля)
//total - скільки всього знімків
//onGo - функція: перейти до знімка з таким номером
function Viewer(props) {
  const item = props.item;
  const view = props.view;

  const hasResult = item.result !== null;
  const hasPre = hasResult && item.result.preprocessed !== null; //для методу Default препроцесингу немає
  const onlyOne = props.total < 2;

  let imageSrc = item.url;
  let imageAlt = 'Оригінал: ' + item.file.name;
  if (view === 'result' && hasResult) {
    imageSrc = item.result.result;
    imageAlt = 'Результат: ' + item.result.preprocessing + ', ' + item.result.filter;
  }
  if (view === 'pre' && hasPre) {
    imageSrc = item.result.preprocessed;
    imageAlt = 'Після препроцесингу: ' + item.result.preprocessing;
  }

  function tabClass(name) {
    if (view === name) {
      return 'active';
    }
    return '';
  }

  function showOriginal() {
    props.onView('original');
  }
  function showResult() {
    props.onView('result');
  }
  function showPre() {
    props.onView('pre');
  }
  function goPrevious() {
    props.onGo(props.index - 1);
  }
  function goNext() {
    props.onGo(props.index + 1);
  }

  return (
    <>
      <nav className="tabs" aria-label="Режим перегляду">
        <button className={tabClass('original')} onClick={showOriginal}>Оригінал</button>
        <button className={tabClass('result')} onClick={showResult} disabled={!hasResult}>Результат</button>
        <button className={tabClass('pre')} onClick={showPre} disabled={!hasPre}>Після препроцесингу</button>
      </nav>

      {item.error && <p className="error" role="alert">{item.error}</p>}

      <section className="stage">
        <img src={imageSrc} alt={imageAlt} />
        {item.busy && (
          <aside className="busy" role="status">
            <p>Обробка знімка…</p>
            <p className="hint">Складні методи можуть працювати до 35 секунд.</p>
          </aside>
        )}
      </section>

      <nav className="pager" aria-label="Перемикання знімків">
        <button onClick={goPrevious} disabled={onlyOne} aria-label="Попередній знімок">‹</button>
        <span>{props.index + 1} із {props.total}</span>
        <button onClick={goNext} disabled={onlyOne} aria-label="Наступний знімок">›</button>
        <strong>{item.file.name}</strong>
      </nav>
    </>
  );
}