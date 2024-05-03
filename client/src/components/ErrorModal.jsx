import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import Stack from '@mui/joy/Stack';
import {useNavigate} from "react-router-dom";
import {useState} from "react";

export const ErrorModal = ({error}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  return (
    <Modal
      open={open}
      aria-labelledby={'error-modal'}
    >
      <ModalDialog
        size={'md'}
        sx={{
          color: 'white',
          backgroundColor: 'black',
          borderColor: 'black'
        }}
      >
        <DialogTitle>Error</DialogTitle>
        {error}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          <Stack spacing={2}>
            <button
              type="submit"
              aria-label='go-home'
              className={'hoverbtn'}
              style={{height: '2.5rem'}}
            >
              Go Home
            </button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  )
}