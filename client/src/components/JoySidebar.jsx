import {useEffect, useState, useContext, useCallback} from 'react';
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

  const projects = data?.getQuickDataFromUser;

  return (
    <div>
      <button onClick={() => setOpen(true)}>
        Browse
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        invertedColors
      >
        <ModalClose />
        <DialogTitle>Files</DialogTitle>
        <DialogContent>
          <List>
            {projects && projects.map(({_id, name, type, date}, idx) => (
              <ListItem key={idx}>
                <ListItemButton onClick={() => setOpen(false)}>
                  {name}
                </ListItemButton>
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
          <Avatar size="lg" />
          <div>
            <Typography level="title-md">Username</Typography>
            <Typography level="body-sm">joined 20 Jun 2023</Typography>
          </div>
        </Box>
      </Drawer>
    </div>
  );
}
