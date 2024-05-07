import {useParams} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {GETDOC, QUICKDATA, UPDATEDOC, USERDOCS} from "../queries";
import {useState} from "react";
import {process_string} from '../wasm/lala_lib';
import {Delete} from './Delete';
import CircularProgress from "@mui/joy/CircularProgress";
import Textarea from '@mui/joy/Textarea';
import Input from '@mui/joy/Input';
import {ErrorModal} from "./ErrorModal";
import {ErrorBar} from "./ErrorBar";
import * as val from '../validation.js';

export const Document = () => {
  const {id} = useParams();
  const [errMsg, setErrMsg] = useState('');
  const [popUp, setPopUp] = useState('');
  const [completed, setCompleted] = useState(true);
  const {loading,data} = useQuery(GETDOC, {
      variables: {id},
      onError: (e) => setErrMsg(e.message),
      fetchPolicy: 'network-only'
  });
  const [saveDoc] = useMutation(UPDATEDOC, {
    onError: (e) => setErrMsg(e.message),
    onCompleted: () => setCompleted(true),
    update(cache, { data: { updateDocument } }){
      const {getUserDocuments} = cache.readQuery({query: USERDOCS}) || {};
      if (getUserDocuments) {
        cache.writeQuery({
          query: USERDOCS,
          data: {
            getUserDocuments:
              [
                {
                  _id: updateDocument._id,
                  name: updateDocument.name,
                  date: updateDocument.date
                },
                ...getUserDocuments.filter(doc => doc._id !== updateDocument._id)
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
                  _id: updateDocument._id,
                  name: updateDocument.name,
                  type: 'document',
                  date: updateDocument.date
                },
                ...getQuickDataFromUser.filter(qd => qd._id !== updateDocument._id)
              ]
          }
        });
      }
      const {getDocumentById} = cache.readQuery({query: GETDOC, variables: {id: updateDocument._id}}) || {};
      if (getDocumentById){
        cache.writeQuery({
          query: GETDOC,
          data: {
            getDocumentById: {
                _id: updateDocument._id,
                file: updateDocument.file,
                name: updateDocument.name,
                date: updateDocument.date
              }
          }
        });
      }
    }
  });
  const [output, setOutput] = useState('');
  const [timeTaken, setTimeTaken] = useState('');

  const runLala = (e) => {
    e.preventDefault();
    let input = document.getElementById('lala-input')?.value;
    try {
      input = val.checkString(input, 'file content');
    } catch(err) {
      setPopUp(err);
      return;
    }
    setPopUp('');
    const tick = performance.now();
    const interpreted = process_string(input);
    const tock = performance.now();
    setTimeTaken(`Lala took ${(tock - tick).toFixed(2)} milliseconds.`);
    setOutput(interpreted);
  }

  if (loading)
    return (
      <div style={{marginTop: '8rem'}}>Loading document...</div>
    );
  if (errMsg) {
    return (
      <ErrorModal error={errMsg}/>
    );
  }

  const doc = data?.getDocumentById;

  if (!doc)
    return (
      <ErrorModal error={errMsg}/>
    );

  const onClickSave = (e) => {
    e.preventDefault();
    setCompleted(false);
    let name = document.getElementById('file-name')?.value;
    try {
      name = val.checkString(name, 'file name');
    } catch(e) {
      setCompleted(true);
      setPopUp(e);
      return;
    }
    let file = document.getElementById('lala-input')?.value;
    try {
      file = val.checkString(file, 'file content');
    } catch(e) {
      setCompleted(true);
      setPopUp(e);
      return;
    }
    setPopUp('');
    try {
      const tick = performance.now();
      const interpreted = process_string(input);
      const tock = performance.now();
      setTimeTaken(`Lala took ${(tock - tick).toFixed(2)} milliseconds.`);
      setOutput(interpreted);
    } catch(_) {
      alert(`Something went wrong with the interpreter. Please double check your input. If the issue persists and you are sure you aren't doing anything wrong, try again later.`);
    }
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      runLala(e);
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

  return (
    <>
      <br/>
      <div className={'file-options'} style={{zIndex: 2}}>
        <button style={{marginRight: '0.5rem'}} onClick={onClickSave}>
          {completed ? "Save Document" : <CircularProgress variant={'soft'} color={'neutral'} thickness={1}/>}
        </button>
        <Delete
          type={'Document'}
          name={doc.name}
          id={doc._id}
        />
      </div>
      <div align={'center'} style={{marginTop: '8rem'}}>
        <Input
          onKeyDown={handleSave}
          id={'file-name'}
          defaultValue={doc.name}
          autoComplete={'off'}
          size={'md'}
          style={{
            height: '100%',
            backgroundColor: 'black',
            color: 'white',
            width: `${doc.name.length + 3}rem`,
            marginTop: '5rem'
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
          slotProps={{input: {id: 'file-name'}}}
        />
        <cite>
          Last saved: {doc.date}
        </cite>
      </div>
      <div className="document">
        {/* Text editor */}
        <span className="text-editor" style={{paddingLeft: '0.5rem'}}>
          <Textarea
            onKeyDown={handleKeyDown}
            style={{height: '100%', backgroundColor: 'black', color: 'white'}}
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
            slotProps={{textarea: {id: 'lala-input', autoFocus: true}}}
            defaultValue={doc.file}
          />
          <button onClick={runLala}>Run</button>
        </span>
        <span className="terminal">
          {output &&
            <>
              Output:
              <br/>
              <div>
                {output.split('\n').map((row, idx) => {
                  return (
                    <div key={idx}>
                      {row}
                    </div>
                  )
                })}
              </div>
            </>
          }
          {timeTaken &&
            <>
              <br/>
              {timeTaken}
            </>
          }
        </span>
      </div>
      {
        popUp && <ErrorBar message={popUp}/>
      }
    </>
  )
}