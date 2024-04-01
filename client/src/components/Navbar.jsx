import {doSignOut} from "../firebase/FirebaseFns";
import {Sidebar} from "./JoySidebar.jsx";

export const Navbar = () => {
  return (
    <nav>
      <div className="nav-item">
        <button onClick={() => console.log('hi')}>Press me</button>
      </div>
      <div className="nav-item">
        <Sidebar/>
      </div>
      <div className="nav-item">
        <button onClick={doSignOut}>Sign out</button>
      </div>
    </nav>
  )
}