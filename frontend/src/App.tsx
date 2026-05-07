import { Routes, Route } from 'react-router-dom';

function App() {
  return (
      <Routes>
        // Pages with standard layout
        <Route element={null}>
          <Route path="/" element={null} />
        </Route>
      </Routes>
  );
}

export default App;
