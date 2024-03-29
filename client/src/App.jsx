import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client'; // Import io function from socket.io-client
import reactLogo from './assets/react.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const socketRef = useRef(); // Import useRef

  useEffect(() => {
    socketRef.current = io('http://127.0.0.1:8080');

    socketRef.current.on('output', (({output}) => console.log(output)));
    return () => {
      socketRef.current.disconnect();
    };
  }, []);
  
  const pingServer = () => {
    console.log('attempting to ping server');
    socketRef.current.emit('run', {cell_text:"let a = 1 0 0 ; 0 1 0 ; 0 0 1", auth: "123"});
  };

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <br/>
        <br/>
        <br/>
        <button onClick={pingServer}>
          ping server
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App;
