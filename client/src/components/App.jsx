import '../styles/App.css';
import {Route, Routes} from 'react-router-dom';
import SocialSignIn from './SocialSignIn';
import PrivateRoute from "./PrivateRoute";
import {Home} from "./Home";
import {Document} from "./Document";
import {useContext} from "react";
import {AuthContext} from './AuthContext';
import {Navbar} from "./Navbar";
import {Notebook} from "./Notebook";
import {Documents} from "./Documents";
import {Notebooks} from "./Notebooks";
import {Guide} from "./Guide"

const App = () => {

  const {currentUser} = useContext(AuthContext);

  return (
    <>
      {currentUser && <Navbar/>}
      <main>
        <Routes>
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="/notebooks" element={<PrivateRoute />}>
            <Route path="/notebooks" element={<Notebooks />} />
          </Route>
          <Route path="/documents" element={<PrivateRoute />}>
            <Route path="/documents" element={<Documents />} />
          </Route>
          <Route path="/notebooks/:id" element={<PrivateRoute />}>
            <Route path="/notebooks/:id" element={<Notebook />} />
          </Route>
          <Route path="/documents/:id" element={<PrivateRoute />}>
            <Route path="/documents/:id" element={<Document />} />
          </Route>
          <Route path="/guide" element={<PrivateRoute />}>
            <Route path="/guide" element={<Guide />} />
          </Route>
          <Route path="/signin" element={<SocialSignIn />} />
        </Routes>
      </main>
    </>
  )
}

export default App;
