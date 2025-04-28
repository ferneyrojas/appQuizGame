// import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './components/Menu';
import Game from './components/Game';
import './index.css'; // Import basic styling

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/game/:theme" element={<Game />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
