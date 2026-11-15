//еталон контурів для поточного знімка
//props:
//item - поточний знімок
//onChange - функція: отримує файл еталона, або null, щоб прибрати еталон
function GroundTruthPanel(props) {
  const item = props.item;
  function handleFiles(files) {
    props.onChange(files[0]); 
  }
  let buttonText = 'Додати еталон';
  if (item.gt) {
    buttonText = 'Замінити еталон';
  }
  return (
    <section className="panel">
      <h2>Еталон контурів</h2>

      {item.gt ? (
        <p>{item.gt.name} <button className="button small" onClick={() => props.onChange(null)}>Прибрати</button></p>
      ) : (
        <p className="hint">Без еталона розрахуються лише MSE, PSNR і SSIM.</p>
      )}

      <FileButton label={buttonText} small onFiles={handleFiles} />
    </section>
  );
}