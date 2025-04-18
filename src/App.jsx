import { useState } from 'react'
import './App.css'
import PerplexityDemo from './components/PerplexityDemo'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <PerplexityDemo />
    </div>
  )
}

export default App