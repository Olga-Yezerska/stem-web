//сторінка «Технології та джерела»
function TechPage() {
  const tech = [
    ['React 18', 'інтерфейс: компоненти, стан (useState), запити до сервера (useEffect)'],
    ['HTML і CSS', 'розмітка та адаптивне оформлення'],
    ['FastAPI (Python)', 'сервер: приймає знімки, повертає результат і метрики'],
    ['OpenCV, NumPy, SciPy, scikit-learn', 'алгоритми обробки зображень і розрахунок метрик'],
  ];
  const links = [
    ['Код дослідження на GitHub', AUTHOR.repository],
    ['Документація React', 'https://react.dev'],
    ['MDN Web Docs', 'https://developer.mozilla.org'],
    ['Документація FastAPI', 'https://fastapi.tiangolo.com'],
    ['Документація OpenCV', 'https://docs.opencv.org'],
  ];
  return (
    <div className="about">
      <Breadcrumbs trail={['work', 'about', 'author', 'tech']} />
      <h2>Технології та джерела</h2>
      <h2>Що використано</h2>
      <dl>
        {tech.map(([name, text]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
      <h2>Корисні посилання</h2>
      <ul>
        {links.map(([label, url]) => (
          <li key={url}>
            <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
