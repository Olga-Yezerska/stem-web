//головний компонент: шапка, навігація, вибір сторінки і підвал
const { useState, useEffect } = React;
const PAGES = ['work', 'about', 'author', 'tech'];
function pageFromHash() {
  const name = window.location.hash.replace('#/', '');
  if (PAGES.includes(name)) {
    return name;
  }
  return 'work'; 
}
function App() {
  const [page, setPage] = useState(pageFromHash());
  function onHashChange() {
    setPage(pageFromHash());
    window.scrollTo(0, 0);
  }
  function listenToHash() {
    window.addEventListener('hashchange', onHashChange);
    function stopListening() {
      window.removeEventListener('hashchange', onHashChange);
    }
    return stopListening;
  }
  useEffect(listenToHash, []);
  function updateTitle() {
    document.title = TITLES[page] + ' — Контури аерознімків';
  }
  useEffect(updateTitle, [page]);
  let workClass = '';
  let aboutClass = '';
  if (page === 'work') {
    workClass = 'active';
  } else {
    aboutClass = 'active';
  }
  return (
    <>
      <header>
        <h1>Контури аерознімків</h1>
        <nav aria-label="Основна навігація">
          <a href="#/" className={workClass}>Робочий простір</a>
          <a href="#/about" className={aboutClass}>Про проєкт</a>
        </nav>
      </header>
      <main>
        {/* hidden ховає робочий простір, але не видаляє його, тому знімки не зникають при переході */}
        <section hidden={page !== 'work'}>
          <WorkPage />
        </section>
        {page === 'about' && <AboutPage />}
        {page === 'author' && <AuthorPage />}
        {page === 'tech' && <TechPage />}
      </main>
      <footer>
        <p>
          STEM-проєкт, дисципліна «{AUTHOR.course}» ·{' '}
          <a href={AUTHOR.repository} target="_blank" rel="noopener noreferrer">Код на GitHub</a>
        </p>
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);