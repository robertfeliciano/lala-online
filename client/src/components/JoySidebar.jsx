import {useContext, useState} from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Typography from '@mui/joy/Typography';
import ModalClose from '@mui/joy/ModalClose';
import {AuthContext} from './AuthContext';
import queries from '../queries';
import {useQuery} from "@apollo/client";
import {NavLink} from "react-router-dom";

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  // const [projects, setProjects] = useState([]);

  // const x = useQuery(queries.QUICKDATA);
  // console.log(x.data.getQuickDataFromUser);
  // console.log(x);
  // if (getQuickDataFromUser)
  //   setProjects(getQuickDataFromUser);
  // setProjects(x?.data?.getQuickDataFromUser);


  // console.log(projects);

  const {data, loading} = useQuery(queries.QUICKDATA);
  if (loading)
    return <div><button onClick={() => setOpen(true)}>
      Browse
    </button></div>;

  const projects = data?.getQuickDataFromUser || [];
  const {currentUser} = useContext(AuthContext);
  console.log(currentUser);

  // TODO use useLocation to highlight what file they're on

  return (
    <div>
      <button onClick={() => setOpen(true)}>
        Browse
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
      >
        <ModalClose />
        <DialogTitle>Files</DialogTitle>
        <DialogContent>
          <List>
            {projects && projects.map(({_id, name, type, date}, idx) => (
              <ListItem key={idx}>
                <NavLink to={`${type}s/${_id}`}>
                  <ListItemButton onClick={() => setOpen(false)}>
                    {name}
                  </ListItemButton>
                </NavLink>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            p: 1.5,
            pb: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {currentUser.photoURL ? <Avatar size="lg" src={currentUser.photoURL}/> : <Avatar size="lg" /> }
          <div>
            <Typography level="title-md">{currentUser.displayName}</Typography>
            <Typography level="body-sm">{currentUser.email}</Typography>
          </div>
        </Box>
      </Drawer>
    </div>
  );
}
