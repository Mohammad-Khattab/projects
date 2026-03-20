import { useState, useEffect } from 'react';
import './App.css';
import ProjectCard from './components/ProjectCard';
import AddModal from './components/AddModal';

interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  tags?: string;
  createdAt: string;
}

type Tab = 'games' | 'websites';
type Theme = 'dark' | 'light';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('games');
  const [games, setGames] = useState<Project[]>(() => loadFromStorage('games', []));
  const [websites, setWebsites] = useState<Project[]>(() => loadFromStorage('websites', []));
  const [theme, setTheme] = useState<Theme>(() => loadFromStorage('theme', 'dark'));
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('websites', JSON.stringify(websites));
  }, [websites]);

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }

  function handleAdd(project: Project) {
    if (tab === 'games') setGames(prev => [project, ...prev]);
    else setWebsites(prev => [project, ...prev]);
    setShowModal(false);
  }

  function handleDelete(id: string) {
    if (tab === 'games') setGames(prev => prev.filter(g => g.id !== id));
    else setWebsites(prev => prev.filter(w => w.id !== id));
  }

  const items = tab === 'games' ? games : websites;
  const emptyMsg = tab === 'games'
    ? 'No games yet — add your first one!'
    : 'No websites yet — add your first one!';

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-icon">{tab === 'games' ? '🎮' : '🌐'}</span>
          <h1 className="logo-text">My Portfolio</h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <nav className="tabs">
        <button
          className={`tab-btn ${tab === 'games' ? 'active' : ''}`}
          onClick={() => setTab('games')}
        >
          🎮 Games {games.length > 0 && <span className="count">{games.length}</span>}
        </button>
        <button
          className={`tab-btn ${tab === 'websites' ? 'active' : ''}`}
          onClick={() => setTab('websites')}
        >
          🌐 Websites {websites.length > 0 && <span className="count">{websites.length}</span>}
        </button>
      </nav>

      <main className="main">
        <div className="toolbar">
          <button className="btn-primary add-btn" onClick={() => setShowModal(true)}>
            + Add {tab === 'games' ? 'Game' : 'Website'}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>{emptyMsg}</p>
          </div>
        ) : (
          <div className="grid">
            {items.map(item => (
              <ProjectCard key={item.id} project={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddModal
          type={tab === 'games' ? 'game' : 'website'}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
