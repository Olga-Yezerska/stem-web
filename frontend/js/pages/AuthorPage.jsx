//сторінка «Про автора»
function AuthorPage() {
  const details = [
    ['Автор', AUTHOR.name],
    ['Університет', AUTHOR.university],
    ['Група', AUTHOR.group],
    ['Пошта', AUTHOR.email],
    ['Дисципліна', AUTHOR.course],
    ['Лектор', AUTHOR.lecturer],
  ];
  return (
    <div className="about">
      <Breadcrumbs trail={['work', 'about', 'author']} />
      <h2>Про автора</h2>
      <dl>
        {details
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        <div>
          <dt>GitHub</dt>
          <dd><a href={AUTHOR.github} target="_blank" rel="noopener noreferrer">{AUTHOR.github}</a></dd>
        </div>
      </dl>
      <p>Нижче перелік технологій, які використано в проєкті, і корисні посилання.</p>
      <a className="button" href="#/tech">Технології та джерела →</a>
    </div>
  );
}
