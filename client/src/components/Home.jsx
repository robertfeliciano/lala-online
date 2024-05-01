import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {CreateNewThing} from "./CreateFile";
import Typography from "@mui/joy/Typography";

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

  const Description = ({children}) => {
    return <Typography
      level='h4'
      sx={{
        color: 'white',
        marginBottom: '1.75rem'
      }}
      fontSize={'lg'}
    >
      {children}
    </Typography>
  }

  return (<div className={'home-select'}>
    <Description>
      Lala Online is an online text editor for my custom programming
      language, Lala.
    </Description>
    <Description>
      Documents are standard text editors with one file that you can edit and run.
    </Description>
    <Description>
      Notebooks are like Jupyter Notebooks; you can edit and run different cells as you wish.
    </Description>
    <Typography
      level="h2"
      maxWidth={500}
      sx={{
        color: 'white',
        marginBottom: '0.5rem'
      }}
    >
      What would you like to do?
    </Typography>
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
