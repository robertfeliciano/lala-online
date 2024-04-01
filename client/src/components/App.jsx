import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import '../styles/App.css';
import {Route, Routes} from 'react-router-dom';
import SocialSignIn from './SocialSignIn';
import PrivateRoute from "./PrivateRoute";
import {Home} from "./Home";

const App = () => {
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
      <Routes>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/docs" element={<PrivateRoute />}>
          {/*<Route path="/docs" element={<Docs />} />*/}
        </Route>
        <Route path="/notebooks" element={<PrivateRoute />}>
          {/*<Route path="/notebooks" element={<ListThing type="notebooks" />} />*/}
        </Route>
        <Route path="/documents" element={<PrivateRoute />}>
          {/*<Route path="/documents" element={<ListThing type="documents" />} />*/}
        </Route>
        <Route path="/notebooks/:id" element={<PrivateRoute />}>
          {/*<Route path="/notebooks/:id" element={<Notebook />} />*/}
        </Route>
        <Route path="/documents/:id" element={<PrivateRoute />}>
          {/*<Route path="/documents/:id" element={<Document />} />*/}
        </Route>
        <Route path="/signin" element={<SocialSignIn />} />
      </Routes>
    </div>
  )
}

export default App;
