import {Sidebar} from "./Sidebar";
import {SignOut} from './SignOut'

export const Navbar = () => {
  return (
    <nav>
      <div className="nav-item">
        <button onClick={() => console.log('hi')}>Press me</button>
      </div>
      <div className="nav-item">
        <Sidebar/>
      </div>
      <SignOut/>
    </nav>
  )
}