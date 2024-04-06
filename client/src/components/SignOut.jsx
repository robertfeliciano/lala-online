import {doSignOut} from "../firebase/FirebaseFns";
import {useState, Fragment} from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import Stack from '@mui/joy/Stack';
import '../styles/SignOut.css';

export const SignOut = () => {
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      <button onClick={() => setOpen(true)}>
        Sign out
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby={'signout-modal'}
      >
        <ModalDialog
          size={'sm'}
          sx={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black'
          }}
        >
          <DialogTitle>Are you sure you want to sign out?</DialogTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              doSignOut();
            }}
          >
            <Stack spacing={2}>
              <button
                type="submit"
                aria-label='signout'
                className={'hoverbtn'}
                style={{height: '2.5rem'}}
              >
                Sign Out
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
        </ModalDialog>
      </Modal>
    </Fragment>
  );
}