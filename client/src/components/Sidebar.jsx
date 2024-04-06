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
import {QUICKDATA} from '../queries';
import {useQuery} from "@apollo/client";
import {Link, NavLink} from "react-router-dom";
import {Sheet} from "@mui/joy";

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const {currentUser} = useContext(AuthContext);
  const {data, loading, error} = useQuery(QUICKDATA);
  if (loading)
    return (
      <div>
        <button onClick={() => setOpen(true)}>
          Browse
        </button>
      </div>);
  if (error)
    return (
      <div>
        {error.message}
      </div>
    )

  const projects = data?.getQuickDataFromUser || [];

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
        slotProps={{
          content: {
            sx: {
              color: 'white',
              bgcolor: 'transparent',
              p: { md: 3, sm: 0 },
              boxShadow: 'none',
            },
          },
        }}
      >
        <Sheet
          sx={{
            borderRadius: 'md',
            bgcolor: 'black',
            color: "white",
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: '100%',
            overflow: 'auto',
          }}
        >
        <ModalClose sx={{color: 'white'}}/>
        <DialogTitle>Files</DialogTitle>
        <DialogContent>
          <List>
            {projects && projects.map(({_id, name, type, date}, idx) => (
              <ListItem key={idx}>
                <NavLink to={`/${type}s/${_id}`}>
                  <ListItemButton onClick={() => setOpen(false)} sx={{color: "white", borderRadius:'md'}}>
                    {name}, {date}
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
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Typography level="title-md" color="white" style={{paddingTop: '0.25rem'}}>
              {currentUser.displayName}
            </Typography>
          </div>
        </Box>
        </Sheet>
      </Drawer>
    </div>
  );
}
