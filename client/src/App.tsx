import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Button } from './components/ui/button';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex items-center justify-center relative z-10">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <div className="absolute -top-1/2 inset-0 flex items-center justify-center h-[28rem] w-32rem] rounded-full bg-gradient-to-r from-orange-400 via-pink-200 to-blue-500 blur-3xl opacity-40 pointer-events-none z-0"></div>
      </div>
      <h1 className="relative z-10">Vite + React</h1>
      <div className="card relative z-10">
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs relative z-10">
        Developed with ❤️ by [Aditya kbr] | © {new Date().getFullYear()}
      </p>
    
    </>
  );
}

export default App;
