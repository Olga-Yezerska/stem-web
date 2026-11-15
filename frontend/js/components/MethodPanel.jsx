//вибір методу обробки: препроцесинг, фільтр, параметр і кнопка «Застосувати»
//props:
//busy - чи йде обробка зараз (тоді кнопка вимкнена)
//onApply - функція: отримує препроцесинг, фільтр і параметр
const { useState, useEffect } = React; 
function findByName(list, name) {
  for (const item of list) {
    if (item.name === name) {
      return item;
    }
  }
  return null;
}
function MethodPanel(props) {
  const [methods, setMethods] = useState(null); //список методів з сервера
  const [methodsError, setMethodsError] = useState(''); //текст помилки, якщо сервер недоступний
  const [pre, setPre] = useState('Default'); //обраний препроцесинг
  const [filter, setFilter] = useState('Canny'); //обраний фільтр
  const [paramText, setParamText] = useState(''); //текст у полі «Параметр»

  function showError() {
    setMethodsError('Не вдалося з’єднатися із сервером. Перевірте, чи він запущений.');
  }
  function loadList() {
    loadMethods().then(setMethods).catch(showError);
  }
  useEffect(loadList, []);
  if (methodsError !== '') {
    return (
      <section className="panel">
        <h2>Метод обробки</h2>
        <p className="error">{methodsError}</p>
      </section>
    );
  }
  if (methods === null) {
    return (
      <section className="panel">
        <h2>Метод обробки</h2>
        <p className="hint">Завантажуємо методи…</p>
      </section>
    );
  }
  function changePre(event) {
    setPre(event.target.value);
  }
  function changeFilter(event) {
    const name = event.target.value;
    setFilter(name);
    const info = findByName(methods.filters, name);
    if (info.param) {
      setParamText(String(info.param.default));
    } else {
      setParamText('');
    }
  }
  function changeParam(event) {
    setParamText(event.target.value);
  }
  function apply() {
    props.onApply(pre, filter, param);
  }

  const preInfo = findByName(methods.preprocessing, pre);
  const filterInfo = findByName(methods.filters, filter);
  let param = null; 
  let paramError = '';   
  if (filterInfo.param) {
    const spec = filterInfo.param;
    param = Number(paramText.replace(',', '.')); 
    if (paramText.trim() === '' || isNaN(param) || param < spec.min || param > spec.max) {
      paramError = 'Введіть число від ' + spec.min + ' до ' + spec.max;
    } else if (spec.type === 'int' && !Number.isInteger(param)) {
      paramError = 'Потрібне ціле число';
    }
  }
  let problem = null;
  for (const pair of methods.incompatible) {
    if (pair.preprocessing === pre && pair.filter === filter) {
      problem = pair;
    }
  }
  const canApply = !props.busy && paramError === '' && problem === null;
  function renderOption(p) {
    return <option key={p.name} value={p.name}>{p.name}</option>;
  }
  function renderFilter(f) {
    let className = 'filter';
    if (f.name === filter) {
      className = 'filter on'; 
    }
    return (
      <label key={f.name} className={className}>
        <input type="radio" name="filter" value={f.name} checked={f.name === filter} onChange={changeFilter} /> {f.label}
        <small>{f.description}</small>
      </label>
    );
  }
  return (
    <section className="panel">
      <h2>Метод обробки</h2>
      <label htmlFor="pre">Препроцесинг</label>
      <select id="pre" value={pre} onChange={changePre}>
        {methods.preprocessing.map(renderOption)}
      </select>
      <p className="hint">{preInfo.description}</p>
      <p><strong>Фільтр контурів</strong></p>
      {methods.filters.map(renderFilter)}
      {filterInfo.param && (
        <p>
          <label htmlFor="param">Параметр ({filterInfo.param.min}–{filterInfo.param.max})</label>
          <input id="param" type="text" value={paramText} onChange={changeParam} />
        </p>
      )}
      {paramError !== '' && <p className="error">{paramError}</p>}
      {problem !== null && <p className="error">{problem.reason}</p>}
      <button className="apply" disabled={!canApply} onClick={apply}>
        {props.busy ? 'Обробка…' : 'Застосувати'}
      </button>
    </section>
  );
}