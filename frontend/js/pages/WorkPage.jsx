//cторінка «Робочий простір»
const { useState } = React; 
let nextId = 1; 
function WorkPage() {
  const [items, setItems] = useState([]); //усі завантажені знімки
  const [current, setCurrent] = useState(0); //номер знімка, який зараз на екрані
  const [view, setView] = useState('original'); //яка вкладка відкрита: original, result або pre
  const [message, setMessage] = useState(''); //повідомлення про погані файли
  const item = items[current]; //поточний знімок (undefined, якщо знімків ще немає)

  function changeItem(id, changes) {
    function update(oldItems) {
      const newItems = [];
      for (const oldItem of oldItems) {
        if (oldItem.id === id) {
          newItems.push(Object.assign({}, oldItem, changes));
        } else {
          newItems.push(oldItem);
        }
      }
      return newItems;
    }
    setItems(update);
  }
  function addImages(files) {
    const problems = []; 
    const added = [];    
    for (const file of files) {
      const error = checkFile(file);
      if (error !== '') {
        problems.push(file.name + ': ' + error);
      } else {
        added.push({
          id: nextId,
          file: file,
          url: URL.createObjectURL(file),
          gt: null,      
          result: null,  
          busy: false,   
          error: '',     
        });
        nextId = nextId + 1;
      }
    }
    setMessage(problems.join('. '));
    if (added.length > 0) {
      setItems(items.concat(added));
    }
  }
  function removeImage(index) {
    URL.revokeObjectURL(items[index].url); 
    const rest = [];
    for (let i = 0; i < items.length; i++) {
      if (i !== index) {
        rest.push(items[i]);
      }
    }
    setItems(rest);
    let newCurrent = current;
    if (newCurrent > rest.length - 1) {
      newCurrent = rest.length - 1;
    }
    if (newCurrent < 0) {
      newCurrent = 0;
    }
    setCurrent(newCurrent);
    setView('original');
  }
  function goTo(index) {
    const count = items.length;
    setCurrent((index + count) % count);
    setView('original');
  }
  function setGroundTruth(file) {
    if (file !== null) {
      const error = checkFile(file);
      if (error !== '') {
        setMessage(file.name + ': ' + error);
        return;
      }
    }
    changeItem(item.id, { gt: file, result: null, error: '' });
    setView('original');
  }
  async function apply(pre, filter, param) {
    const id = item.id;
    changeItem(id, { busy: true, error: '' });
    try {
      const result = await sendToServer(item, pre, filter, param);
      changeItem(id, { busy: false, result: result });
      setView('result');
    } catch (e) {
      let text = e.message;
      if (e instanceof TypeError) {
        text = 'Не вдалося з’єднатися із сервером.'; 
      }
      changeItem(id, { busy: false, error: text });
    }
  }

  if (items.length === 0) {
    return (
      <section className="empty">
        <h2>Додайте аерознімки</h2>
        <p>
          Оберіть один або кілька файлів (JPG, PNG, BMP, WEBP до {MAX_MB} МБ). Дуже великі знімки
          сервер автоматично зменшує перед обробкою.
        </p>
        {message !== '' && <p className="warning">{message}</p>}
        <FileButton label="Обрати знімки" multiple onFiles={addImages} />
      </section>
    );
  }

  return (
    <section className="work">
      <article>
        {message !== '' && <p className="warning">{message}</p>}
        <Viewer item={item} view={view} onView={setView} index={current} total={items.length} onGo={goTo} />
        <Thumbnails items={items} current={current} onGo={goTo} onRemove={removeImage} onAdd={addImages} />
      </article>

      <aside>
        <GroundTruthPanel item={item} onChange={setGroundTruth} />
        <MethodPanel busy={item.busy} onApply={apply} />
        <MetricsPanel result={item.result} />
      </aside>
    </section>
  );
}