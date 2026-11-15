//запити до сервера
//сервера список методів обробки
async function loadMethods() {
  const response = await fetch('/api/methods');
  if (!response.ok) {
    throw new Error('Сервер повернув помилку ' + response.status);
  }
  return response.json();
}
//надсилає знімок на сервер і повертає результат обробки
async function sendToServer(item, preprocessing, filter, param) {
  const form = new FormData();
  form.append('file', item.file);
  if (item.gt) {
    form.append('ground_truth', item.gt);
  }
  form.append('preprocessing', preprocessing);
  form.append('filter', filter);
  if (param !== null) {
    form.append('param', param);
  }
 
  const response = await fetch('/api/process', { method: 'POST', body: form });
  const data = await response.json();
 
  if (!response.ok) {
    throw new Error(typeof data.detail === 'string' ? data.detail : 'Помилка сервера');
  }
  return data;
}
