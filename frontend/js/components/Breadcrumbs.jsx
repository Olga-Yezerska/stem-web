//показує, де користувач зараз, і дозволяє піднятися вище
//props:
//trail - список сторінок, наприклад ['work', 'about', 'author']
function Breadcrumbs(props) {
  const last = props.trail.length - 1; 
  return (
    <nav className="crumbs" aria-label="Ви тут">
      {props.trail.map((page, index) => {
        if (index === last) {
          return <span key={page} aria-current="page">{TITLES[page]}</span>;
        }

        let link = '#/' + page;
        if (page === 'work') {
          link = '#/';
        }
        return (
          <span key={page}>
            <a href={link}>{TITLES[page]}</a> ›{' '}
          </span>
        );
      })}
    </nav>
  );
}