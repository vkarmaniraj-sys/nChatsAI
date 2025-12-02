
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeData from './components/Home';
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeData />} />
        <Route path="/c/:Sessionid" element={<HomeData />} />
      </Routes>
    </Router>
  )
}

export default App