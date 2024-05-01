import {Sidebar} from "./Sidebar";
import {SignOut} from './SignOut'
import {useNavigate} from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav style={{zIndex: 2}}>
      <div className="nav-item">
        <button onClick={() => navigate('/')}>Home</button>
      </div>
      <div className="nav-item">
        <Sidebar/>
      </div>
      <div className="nav-item">
        <button onClick={() => navigate('/guide')}>Guide</button>
      </div>
      <SignOut/>
    </nav>
  )
}