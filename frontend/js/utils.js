//Допоміжні функції
//Перевіряє файл ще до відправки на сервер. Повертає текст помилки або '' якщо все добре
function checkFile(file) {
  const name = file.name.toLowerCase();
  //розширення має бути зі списку дозволених
  let allowed = false;
  for (const ext of EXTENSIONS) {
    if (name.endsWith(ext)) {
      allowed = true;
    }
  }
  if (!allowed) {
    return 'непідтримуваний формат (потрібно JPG, PNG, BMP або WEBP)';
  }
 
  if (file.size === 0) {
    return 'файл порожній';
  }
 
  if (file.size > MAX_MB * 1024 * 1024) {
    return 'файл завеликий (максимум ' + MAX_MB + ' МБ)';
  }
 
  return ''; 
}
 
//перетворює число 0.12345 на текст "0,1235" (4 цифри після коми)
function showNumber(value) {
  if (value === null) {
    return '—';
  }
  return value.toFixed(4).replace('.', ',');
}