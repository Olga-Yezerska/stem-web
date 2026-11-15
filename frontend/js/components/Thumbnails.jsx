//стрічка маленьких зображень усіх завантажених знімків.
//props:
//items - список знімків
//current - номер знімка, який зараз вибраний
//onGo - функція: перейти до знімка з таким номером
//onRemove - функція: прибрати знімок з таким номером
//onAdd - функція: додати нові файли
function Thumbnails(props) {
  return (
    <div className="thumbs">
      {props.items.map((item, index) => {
        let className = 'thumb';
        if (index === props.current) {
          className = 'thumb selected';
        }

        return (
          <div key={item.id} className={className}>
            <button className="pick" onClick={() => props.onGo(index)}>
              <img src={item.url} alt="" />
              <span>{item.file.name}</span>
            </button>
            <button
              className="remove"
              onClick={() => props.onRemove(index)}
              aria-label={'Прибрати ' + item.file.name}
            >
              ×
            </button>
          </div>
        );
      })}
      <FileButton label="Додати знімки" multiple small onFiles={props.onAdd} />
    </div>
  );
}