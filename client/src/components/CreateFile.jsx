import {useMutation} from "@apollo/client";
import {useNavigate} from "react-router-dom";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import {Fragment, useEffect, useState} from "react";
import {
  NEWDOC,
  NEWNB,
  QUICKDATA,
  USERDOCS,
  USERNBS
} from '../queries.js';
import '../styles/SignOut.css';
import CircularProgress from "@mui/joy/CircularProgress";

export const CreateNewThing = ({thing, handleClose}) => {
  const newDoc = thing.toLowerCase() === 'document';
  const [errMsg, setErrMsg] = useState('');
  const [newDocData, setNewDocData] = useState(undefined);
  const [newNbData, setNewNbData] = useState(undefined);
  const navigate = useNavigate();
  const [newDocument, {data: docData, loading: docLoading}] = useMutation(
    NEWDOC,
    {
      onError: (err) => setErrMsg(err.message),
      onCompleted: (data) => setNewDocData(data.newDocument),
      // TODO Update cache for /documents and /notebooks route in the useMutations and quickdata cache
      update(cache, { data: { newDocument } }){
        const {getUserDocuments} = cache.readQuery({query: USERDOCS}) || {};
        if (getUserDocuments)
          cache.writeQuery({
            query: USERDOCS,
            data: {getUserDocuments: [...getUserDocuments, newDocument]}
          });

        const {getQuickDataFromUser} = cache.readQuery({query: QUICKDATA}) || {};
        if (getQuickDataFromUser)
          cache.writeQuery({
            query: QUICKDATA,
            data: {getQuickDataFromUser: [
                {
                  _id: newDocument._id,
                  name: newDocument.name,
                  type: 'document',
                  date: newDocument.date
                },
                ...getQuickDataFromUser
              ]}
          });
      }
    }
  );

  const [newNotebook, {data: nbData, loading: nbLoading}] = useMutation(
    NEWNB,
    {
      onError: (err) => setErrMsg(err.message),
      onCompleted: (data) => setNewNbData(data.newNotebook),
      update(cache, { data: { newNotebook } }){
        const {getUserNotebooks} = cache.readQuery({query: USERNBS}) || {};
        if (getUserNotebooks)
          cache.writeQuery({
            query: USERNBS,
            data: {getUserDocuments: [...getUserNotebooks, newNotebook]}
          });

        const {getQuickDataFromUser} = cache.readQuery({query: QUICKDATA}) || {};
        if (getQuickDataFromUser)
          cache.writeQuery({
            query: QUICKDATA,
            data: {getQuickDataFromUser: [
                {
                  _id: newNotebook._id,
                  name: newNotebook.name,
                  type: 'notebook',
                  date: newNotebook.date
                },
                ...getQuickDataFromUser
              ]}
          });
      }
    }
  );

  useEffect(() => {
    if (newDocData) {
      navigate(`/documents/${newDocData._id}`)
    }
  }, [newDocData]);

  useEffect(() => {
    if (newNbData) {
      navigate(`/notebooks/${newNbData._id}`)
    }
  }, [newNbData]);

  const onSubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('file-name')?.value;
    // TODO some error checking
    const variables = {name};
    if (newDoc)
      newDocument({variables});
    else
      newNotebook({variables});

    if (docData)
      navigate(`/documents/${docData._id}`);
    if (nbData)
      navigate(`/$notebooks/${nbData._id}`);

  }

  return (
    <Fragment>
      <Modal
        open={true}
        aria-labelledby={'create-modal'}
      >
        <ModalDialog
          size={'sm'}
          sx={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black'
          }}
        >
          <DialogTitle>{`Create new ${thing.toLowerCase()}`}</DialogTitle>
          <form
            onSubmit={onSubmit}
            autoComplete="off"
          >
            <Stack spacing={2}>
              <Input
                id={'file-name'}
                defaultValue={`New ${thing}`}
                variant={'soft'}
              />
              <button
                type="submit"
                aria-label='confirm-create'
                className={'hoverbtn'}
                style={{height: '2.5rem'}}
              >
                Create
              </button>
              <button
                onClick={handleClose}
                aria-label={'cancel'}
                className={'hoverbtn'}
                style={{height: '2.5rem'}}
              >
                Cancel
              </button>
            </Stack>
          </form>
          { docLoading || nbLoading ?
            <CircularProgress variant={'soft'} color={'neutral'} thickness={1}/> : null
          }
          {
            errMsg && <p>{errMsg}</p>
          }
        </ModalDialog>
      </Modal>
    </Fragment>
  )
}