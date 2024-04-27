import {useState, Fragment} from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import Stack from '@mui/joy/Stack';
import '../styles/SignOut.css';
import {DELDOC, DELNB, QUICKDATA, USERDOCS, USERNBS} from "../queries.js";
import {useMutation} from "@apollo/client";
import CircularProgress from "@mui/joy/CircularProgress";
import {useNavigate} from "react-router-dom";

export const Delete = (props) => {
  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [completed, setCompleted] = useState(true)
  const navigate = useNavigate();

  const [deleteDoc] = useMutation(DELDOC, {
    onError: (e) => setErrMsg(e.message),
    onCompleted: () => setCompleted(true),
    update(cache, { data: { removeDocument } }) {
      // TODO check if getUserDocuments is empty array and see if thats an issue
      // NOTE i dont think it is an issue
      const {getUserDocuments} = cache.readQuery({query: USERDOCS}) || {};
      if (getUserDocuments)
        cache.writeQuery({
          query: USERDOCS,
          data: {
            getUserDocuments:
              getUserDocuments.filter(doc => doc._id !== removeDocument._id)
          }
        });

      const {getQuickDataFromUser} = cache.readQuery({query: QUICKDATA}) || {};
      if (getQuickDataFromUser)
        cache.writeQuery( {
          query: QUICKDATA,
          data: {
            getQuickDataFromUser:
              getQuickDataFromUser.filter(qd => qd._id !== removeDocument._id)
          }
        });
    }
  });

  const [deleteNB] = useMutation(DELNB, {
    onError: (e) => setErrMsg(e.message),
    onCompleted: () => setCompleted(true),
    update(cache, { data: { removeNotebook } }) {
      const {getUserNotebooks} = cache.readQuery({query: USERNBS}) || {};
      if (getUserNotebooks)
        cache.writeQuery({
          query: USERDOCS,
          data: {
            getUserNotebooks:
              getUserNotebooks.filter(doc => doc._id !== removeNotebook._id)
          }
        });

      const {getQuickDataFromUser} = cache.readQuery({query: QUICKDATA}) || {};
      if (getQuickDataFromUser)
        cache.writeQuery( {
          query: QUICKDATA,
          data: {
            getQuickDataFromUser:
              getQuickDataFromUser.filter(qd => qd._id !== removeNotebook._id)
          }
        });
    }
  });

  const handleDelete = (e) => {
    e.preventDefault();
    setCompleted(false);
    if (props.type === 'Document')
      deleteDoc({
        variables: {id: props.id}
      })
    else
      deleteNB({
        variables: {id: props.id}
      });
    setOpen(false);
    navigate(`/${props.type.toLowerCase()}s`)
  }

  return (
    <Fragment>
      <button onClick={() => setOpen(true)} style={{marginLeft: '0.5rem'}}>
        {`Delete ${props.type}`}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby={'delete-modal'}
      >
        <ModalDialog
          size={'sm'}
          sx={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black'
          }}
        >
          <DialogTitle>{`Are you sure you want to delete ${props.name}`}</DialogTitle>
          <form
            onSubmit={handleDelete}
          >
            <Stack spacing={2}>
              <button
                type="submit"
                aria-label='delete'
                className={'hoverbtn'}
                style={{height: '2.5rem'}}
              >
                {completed ? "Delete" : <CircularProgress variant={'soft'} color={'neutral'} thickness={1}/>}
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label={'cancel'}
                className={'hoverbtn'}
                style={{height: '2.5rem'}}
              >
                Cancel
              </button>
            </Stack>
          </form>
          {
            errMsg && <p>{errMsg}</p>
          }
        </ModalDialog>
      </Modal>
    </Fragment>
  )
}