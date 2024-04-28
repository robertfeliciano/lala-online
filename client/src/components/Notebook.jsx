import {useParams} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {GETNB, QUICKDATA, UPDATENB, USERNBS} from "../queries";
import {useState, useEffect, useRef, useContext} from "react";
import { io } from 'socket.io-client';
import {Delete} from './Delete';
import CircularProgress from "@mui/joy/CircularProgress";
import {AuthContext} from './AuthContext';
import Textarea from '@mui/joy/Textarea';
import Input from '@mui/joy/Input';

export const Notebook = () => {
  const {id} = useParams();
  const [errMsg, setErrMsg] = useState('');
  const [completed, setCompleted] = useState(true);
  const [cellIdx, setCellIdx] = useState(0);
  const tick = useRef(0);
  // const [cells, setCells] = useState([]);
  const socketRef = useRef();
  const {loading, error, data} = useQuery(GETNB, {
    variables: {id},
    onError: (e) => setErrMsg(e.message),
    fetchPolicy: 'network-only'
  });

  const nb = data?.getNotebookById;
  const cells = nb?.pairs

  useEffect(() => {
    // set up socket endpoint stuff
    const endpt =  import.meta.env.VITE_KERNEL_ENDPOINT;
    socketRef.current = io(endpt);

    socketRef.current.on('output', (({output}) => {
      const tock = performance.now();
      console.log(output)
      const outLocation = document.getElementById(`lala-output-${cellIdx}`);
      outLocation.innerText = output;
    }));
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const {currentUser} = useContext(AuthContext);
  const [saveNB] = useMutation(UPDATENB, {
    onError: (e) => setErrMsg(e.message),
    onCompleted: () => setCompleted(true),
    update(cache, { data: { updateNotebook } }) {
      const {getUserNotebooks} = cache.readQuery({query: USERNBS}) || {};
      if (getUserNotebooks) {
        cache.writeQuery({
          query: USERNBS,
          data: {
            getUserNotebooks:
              getUserNotebooks.map(nb => nb._id === updateNotebook._id ?
                {
                  _id: updateNotebook._id,
                  name: updateNotebook.name,
                  date: updateNotebook.date
                } : nb)
          }
        });
      }
      const {getQuickDataFromUser} = cache.readQuery({query: QUICKDATA}) || {};
      if (getQuickDataFromUser) {
        cache.writeQuery({
          query: QUICKDATA,
          data: {
            getQuickDataFromUser:
              getQuickDataFromUser.map(qd => qd._id === updateNotebook._id ?
                {
                  _id: updateNotebook._id,
                  name: updateNotebook.name,
                  type: 'notebook',
                  date: updateNotebook.date
                } : qd)
          }
        });
      }
      const {getNotebookById} = cache.readQuery({query: GETNB, variables: {id: updateNotebook._id}}) || {};
      if (getNotebookById) {
        cache.writeQuery({
          query: GETNB,
          data: {
            getNotebookById: {
              _id: updateNotebook._id,
              date: updateNotebook.date,
              name: updateNotebook.name,
              pairs: updateNotebook.pairs
            }
          }
        });
      }
    }
  });

  if (loading || !socketRef.current)
    return (
      <div>
        Loading...
      </div>
    );
  // TODO add errormodal popup or snackbar
  if (errMsg || error)
    return (
      <div>
        {error.message || errMsg};
      </div>
    )


  // TODO add time display to see how long cell takes to run using performance.now()
  // TODO fix the shit where it isnt fucking working across cell things
  // i think its the problem with me using setThing(...)
  // and this causes a remount maybe
  // but that sholdnt be an issue if im using useRef for the socket
  // idk whatever man
  const runCell = (idx) => {
    // setCellIdx(idx);
    let cell = document.getElementById(`lala-input-${idx}`)?.value;
    cell = cell.trim();
    if (!cell || cell === ''){
      console.log('ERROR CHECK -> cell must contain valid lala')
    }
    tick.current = performance.now();
    socketRef.current.emit('run', {cell_text:cell, auth: currentUser.uid});
  }

  const onClickSave = (e) => {
    e.preventDefault();
    setCompleted(false);
    const name = document.getElementById('nb-name')?.value;
    const pairs = [];
    let idx = 0;
    let input = document.getElementById(`lala-input-${idx}`)?.value;
    let output = document.getElementById(`lala-output-${idx}`)?.innerText;
    while (input){
      idx += 1;
      pairs.push( { input, output } );
      input = document.getElementById(`lala-input-${idx}`)?.value;
      output = document.getElementById(`lala-output-${idx}`)?.innerText;
    }
    const id = nb._id;
    const date = new Date();
    const variables = {name, id, pairs, date};
    saveNB({variables});
  }

  return (<>
    <br/>
    <div className={'file-options'} style={{zIndex: 2}}>
      <button style={{marginRight: '0.5rem'}} onClick={onClickSave}>
        {completed ? "Save Notebook" : <CircularProgress variant={'soft'} color={'neutral'} thickness={1}/>}
      </button>
      <Delete
        type={'Notebook'}
        name={nb.name}
        id={nb._id}
      />
    </div>
    <div align={'center'} style={{marginTop: '5rem', zIndex: 1}}>
      <Input
        defaultValue={nb.name}
        autoComplete={'off'}
        style={{
          height: '100%',
          backgroundColor: 'black',
          color: 'white',
          width: `${nb.name.length + 3}rem`,
        }}
        sx={{
          '--Input-focusedInset': 'var(--any, )',
          '--Input-focusedThickness': '0.2rem',
          '--Input-focusedHighlight': 'rgba(13,110,253,.25)',
          '&::before': {
            transition: 'box-shadow .15s ease-in-out',
          },
          '&:focus-within': {
            borderColor: '#86b7fe',
          },
        }}
        slotProps={{input: {id: 'nb-name'}}}
      />
      <cite>
        {nb.date}
      </cite>
    </div>
    <br/>
    <br/>
    <br/>
    {
      cells && cells.map(({input, output}, idx) => {
        return (
          <div key={idx}>
            <div align={'center'}>
              <Textarea
                defaultValue={input}
                minRows={6}
                aria-label={`input-${idx}`}
                style={{
                  height: '100%',
                  backgroundColor: 'black',
                  color: 'white',
                  width: '40rem',
                  marginBottom: '1rem'
                }}
                sx={{
                  '--Textarea-focusedInset': 'var(--any, )',
                  '--Textarea-focusedThickness': '0.2rem',
                  '--Textarea-focusedHighlight': 'rgba(13,110,253,.25)',
                  '&::before': {
                    transition: 'box-shadow .15s ease-in-out',
                  },
                  '&:focus-within': {
                    borderColor: '#86b7fe',
                  },
                }}
                slotProps={{textarea: {id: `lala-input-${idx}`}}}
              />
              <button
                style={{marginBottom: '1rem'}}
                onClick={() => runCell(idx)}>Run Cell
              </button>
            </div>
            <div id={`lala-output-${idx}`}>
              {output}
            </div>
            <button
              style={{marginTop: '1rem'}}
            >
              New Cell
            </button>
          </div>
        )
      })
    }
  </>)
}