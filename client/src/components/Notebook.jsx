import {useParams} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {GETNB, QUICKDATA, UPDATENB, USERNBS} from "../queries";
import {useState, useEffect, useRef} from "react";
import { io } from 'socket.io-client';
import {Delete} from './Delete';
import CircularProgress from "@mui/joy/CircularProgress";
import Textarea from '@mui/joy/Textarea';
import Input from '@mui/joy/Input';
import {ErrorModal} from "./ErrorModal";
import {ErrorBar} from "./ErrorBar";
import * as val from "../validation.js";


export const Notebook = () => {
  const {id} = useParams();

  const [errMsg, setErrMsg] = useState('');
  const [completed, setCompleted] = useState(true);
  const [popUp, setPopUp] = useState('');
  const [cells, setCells] = useState([]);

  const socketRef = useRef();
  const cellIdx = useRef(0);

  const {loading, error, data} = useQuery(GETNB, {
    variables: {id},
    onError: (e) => setErrMsg(e.message),
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getNotebookById) {
        setCells(data.getNotebookById.pairs);
      }
    }
  });

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
              [
                {
                  _id: updateNotebook._id,
                  name: updateNotebook.name,
                  date: updateNotebook.date
                },
                ...getUserNotebooks.filter(nb => nb._id !== updateNotebook._id)
              ]
          }
        });
      }
      const {getQuickDataFromUser} = cache.readQuery({query: QUICKDATA}) || {};
      if (getQuickDataFromUser) {
        cache.writeQuery({
          query: QUICKDATA,
          data: {
            getQuickDataFromUser:
              [
                {
                  _id: updateNotebook._id,
                  name: updateNotebook.name,
                  type: 'notebook',
                  date: updateNotebook.date
                },
                ...getQuickDataFromUser.filter(qd => qd._id !== updateNotebook._id)
              ]
          }
        });
      }
    }
  });

  useEffect(() => {
    // set up socket endpoint stuff
    const endpt =  import.meta.env.VITE_KERNEL_ENDPOINT;
    socketRef.current = io(endpt);

    socketRef.current.on('output', (({output}) => {
      const outLocation = document.getElementById(`lala-output-${cellIdx.current}`);
      outLocation.innerText = output;
    }));
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const nb = data?.getNotebookById

  if (loading || !socketRef.current)
    return (
      <div style={{marginTop: '8rem'}}>Loading notebook...</div>
    );
  if (errMsg)
    return (
      <ErrorModal error={errMsg}/>
    );

  if (!nb)
    return (
      <ErrorModal error={errMsg}/>
    );

  const runCell = (idx) => {
    cellIdx.current = idx;
    let cell = document.getElementById(`lala-input-${cellIdx.current}`)?.value;
    try {
      cell = val.checkString(cell, 'file content');
    } catch(err) {
      setPopUp(err);
      return;
    }
    setPopUp('');
    if (!cell || cell === ''){
      console.log('ERROR CHECK -> cell must contain valid lala')
    }
    socketRef.current.emit('run', {cell_text:cell});
  }

  const addCell = () => {
    setCells(prevCells => [
      ...prevCells,
      { input: 'let a = 1 0 0 ; 0 1 0 ; 0 0 1\na',
        output: '' }
    ]);
  };

  const onClickSave = (e) => {
    e.preventDefault();
    setCompleted(false);
    let name = document.getElementById('nb-name')?.value;
    try {
      name = val.checkString(name, 'notebook name');
    } catch(e) {
      setCompleted(true);
      setPopUp(e);
      return;
    }
    setPopUp('');
    // we can have empty cells
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

  const handleKeyDown = (e, idx) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      runCell(idx);
    }
    else if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      onClickSave(e);
    }
  }

  const handleSave = (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      onClickSave(e);
    }
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
        onKeyDown={handleSave}
        defaultValue={nb.name}
        autoComplete={'off'}
        style={{
          height: '100%',
          backgroundColor: 'black',
          color: 'white',
          width: `${nb.name.length + 3}rem`,
          marginTop: '8rem'
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
        Last saved: {nb.date}
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
                id={`lala-joy-input-${idx}`}
                onKeyDown={(e) => handleKeyDown(e, idx)}
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
                  }
                }}
                slotProps={{textarea: {id: `lala-input-${idx}`}}}
              />
              <button
                style={{marginBottom: '1rem'}}
                onClick={() => runCell(idx)}>Run Cell
              </button>
            </div>
            <div id={`lala-output-${idx}`} style={{marginBottom: '1.5rem'}}>
              {output}
            </div>
          </div>
        )
      })
    }
    <button
      style={{marginTop: '1rem', marginBottom: '1.5rem'}}
      onClick={addCell}
    >
      New Cell
    </button>
    {
      popUp && <ErrorBar message={popUp}/>
    }
  </>)
}