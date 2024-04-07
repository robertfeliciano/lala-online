import {doSignOut} from "../firebase/FirebaseFns";
import {Sidebar} from "./Sidebar";
import {Navbar} from "./Navbar";
import {useContext, useEffect} from "react";
import {AuthContext} from "./AuthContext.jsx";

export const Home = () => {

  return (<>
    <main>
      <h1>Hello!</h1>
    </main>
  </>)
}
