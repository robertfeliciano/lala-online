import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {CreateNewThing} from "./CreateFile";

export const Home = () => {
  const navigate = useNavigate();
  const [docModal, setDocModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);

  const MenuButton = ({text, handleClick}) => {
    return (
      <button
        style={{
          color: 'white',
          marginBottom: '0.75rem',
          width: '12rem'
        }}
        className={'menu-button'}
        onClick={handleClick}
      >
        {text}
      </button>
    )
  }

  return (<div className={'home-select'}>
    <h2>What would you like to do?</h2>
    <MenuButton text={'New Document'} handleClick={() => setDocModal(true)}/>
    <br/>
    <MenuButton text={'New Notebook'} handleClick={() => setNoteModal(true)}/>
    <br/>
    <MenuButton text={'View All Documents'} handleClick={() => navigate('/documents')}/>
    <br/>
    <MenuButton text={'View All Notebooks'} handleClick={() => navigate('/notebooks')}/>
    {
      docModal && <CreateNewThing thing={'Document'} handleClose={() => setDocModal(false)}/>
    }
    {
      noteModal && <CreateNewThing thing={'Notebook'} handleClose={() => setNoteModal(false)}/>
    }
  </div>)
}
