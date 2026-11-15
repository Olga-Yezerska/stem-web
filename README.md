# Контури аерознімків

Веб-застосунок для візуалізації результатів оброблення аерознімків і порівняння метрик якості алгоритмів виявлення контурів.

- `backend/` - FastAPI + OpenCV (алгоритми обробки, метрики); також віддає фронтенд
- `frontend/` - React (без збірки):
  - `index.html`, `style.css`, `lib/` (React)
  - `js/config.js`, `js/utils.js`, `js/api.js` - спільні дані, допоміжні функції, запити до сервера
  - `js/components/` - компоненти (FileButton, Viewer, Thumbnails, GroundTruthPanel, MethodPanel, MetricsPanel, Breadcrumbs)
  - `js/pages/` - сторінки (WorkPage, AboutPage, AuthorPage, TechPage)
  - `js/App.jsx` - головний компонент і навігація

## Запуск 

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Відкрийте http://localhost:8000