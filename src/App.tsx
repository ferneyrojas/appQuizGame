import React from 'react';
// Importamos BrowserRouter, Route y Routes desde react-router-dom
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './components/Menu'; // Importa el componente del menú
import Game from './components/Game'; // Importa el componente del juego
import './index.css'; // Importa estilos básicos

// Componente principal de la aplicación con enrutamiento
function App() {
  // Define la ruta base dinámicamente usando import.meta.env.BASE_URL.
  // Vite establece esto a '/' en desarrollo local y al valor 'base' de vite.config.ts en producción.
  const basename = import.meta.env.BASE_URL;

  return (
    // Envuelve la aplicación con el Router.
    // Usamos la prop 'basename' para indicarle a React Router la ruta base.
    // Esto permite que el enrutamiento funcione correctamente tanto en desarrollo local como en GitHub Pages.
    <Router basename={basename}>
      <div className="app-container">
        <Routes> {/* Define las rutas de la aplicación */}
          {/* Ruta para el menú principal. Coincidirá con la ruta base (por ejemplo, '/' en local, '/nombre_del_repositorio/' en GH Pages) */}
          <Route path="/" element={<Menu />} />
          {/* Ruta para el juego, con un parámetro dinámico para el tema.
              Coincidirá con la ruta base + /game/:theme */}
          <Route path="/game/:theme" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
