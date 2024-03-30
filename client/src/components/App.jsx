import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import reactLogo from '../assets/react.svg';
import '../styles/App.css';
import {Route, Routes} from 'react-router-dom';
import SocialSignIn from './SocialSignIn';
import PrivateRoute from "./PrivateRoute";
import {Home} from "./Home";

function App() {
  // const [count, setCount] = useState(0);
  // const socketRef = useRef();

  // useEffect(() => {
  //   socketRef.current = io('http://127.0.0.1:8080');
  //
  //   socketRef.current.on('output', (({output}) => console.log(output)));
  //   return () => {
  //     socketRef.current.disconnect();
  //   };
  // }, []);
  //
  // const pingServer = () => {
  //   console.log('attempting to ping server');
  //   socketRef.current.emit('run', {cell_text:"let a = 1 0 0 ; 0 1 0 ; 0 0 1", auth: "123"});
  // };

  return (
    <div>
      {/*<header>*/}
      {/* TODO navbar? */}
      {/*</header>*/}
      <Routes>
        <Route path='/' element={<PrivateRoute />}>
          <Route path='/' element={<Home />} />
        </Route>
        <Route path='/signin' element={<SocialSignIn />} />
      </Routes>
    </div>
    // <SocialSignIn />
  )
}

export default App;
