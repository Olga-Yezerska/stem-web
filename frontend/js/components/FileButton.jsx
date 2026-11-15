//кнопка вибору файлів
//props - це дані, які передає батьківський компонент:
//label - текст на кнопці
//multiple - чи можна обрати кілька файлів
//small    - чи робити кнопку меншою
//onFiles  - функція, яку викличемо, коли файли обрано
function FileButton(props) {
  function handleChange(event) {
    const files = Array.from(event.target.files); 
    event.target.value = ''; 
    if (files.length > 0) {
      props.onFiles(files);
    }
  }
 
  let className = 'button';
  if (props.small) {
    className = 'button small';
  }
 
  return (
    <label className={className}>
      {props.label}
      <input
        type="file"
        multiple={props.multiple}
        accept={EXTENSIONS.join(',')}
        onChange={handleChange}
      />
    </label>
  );
}