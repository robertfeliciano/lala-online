import {Sidebar} from "./Sidebar";
import {SignOut} from './SignOut'
import {useNavigate} from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav>
      <div className="nav-item">
        <button onClick={() => console.log('hi')}>Press me</button>
      </div>
      <div className="nav-item">
        <Sidebar/>
      </div>
      <div className="nav-item">
        <button onClick={() => navigate('/')}>Home</button>
      </div>
      <SignOut/>
    </nav>
  )
}