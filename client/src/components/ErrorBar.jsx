import {useState} from 'react';
import Snackbar from '@mui/joy/Snackbar';
import Button from "@mui/joy/Button";

export const ErrorBar = ({message}) => {
  const [open, setOpen] = useState(true);
  return (
      <Snackbar
        autoHideDuration={4000}
        open={open}
        variant={'soft'}
        color={'danger'}
        onClose={(event, reason) => {
          if (reason === 'clickaway') {
            return;
          }
          setOpen(false);
        }}
        endDecorator={
          <Button
            onClick={() => setOpen(false)}
            size="sm"
            variant="soft"
            color="danger"
          >
            Dismiss
          </Button>
        }
      >
        {message}
      </Snackbar>
  );
}
