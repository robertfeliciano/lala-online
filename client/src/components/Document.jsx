import {useParams} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {GETDOC, QUICKDATA, UPDATEDOC, USERDOCS} from "../queries";
import {useState} from "react";
import {process_string} from '../wasm/lala_lib';
import {Delete} from './Delete';
import CircularProgress from "@mui/joy/CircularProgress";
import Textarea from '@mui/joy/Textarea';
import Input from '@mui/joy/Input';

export const Document = () => {
  const {id} = useParams();
  const [errMsg, setErrMsg] = useState('');
  const [completed, setCompleted] = useState(true);
  const {loading,data} = useQuery(GETDOC, {
      variables: {id},
      onError: (e) => setErrMsg(e.message),
      fetchPolicy: 'cache-first'
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
              getUserDocuments.map(doc => doc._id === updateDocument._id ?
                {
                  _id: updateDocument._id,
                  name: updateDocument.name,
                  date: updateDocument.date
                } : doc)
          }
        });
      }
      const {getQuickDataFromUser} = cache.readQuery({query: QUICKDATA}) || {};
      if (getQuickDataFromUser) {
        cache.writeQuery({
          query: QUICKDATA,
          data: {
            getQuickDataFromUser:
              getQuickDataFromUser.map(qd => qd._id === updateDocument._id ?
                {
                  _id: updateDocument._id,
                  name: updateDocument.name,
                  type: 'document',
                  date: updateDocument.date
                } : qd)
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
    const input = document.getElementById('lala-input')?.value;
    if (!input) {
      // TODO show errormodal or snackbar
      setErrMsg('must provide some input to run!');
      return;
    }
    const tick = performance.now();
    const interpreted = process_string(input);
    const tock = performance.now();
    setTimeTaken(`Lala took ${(tock - tick).toFixed(2)} milliseconds.`);
    setOutput(interpreted);
  }

  if (loading)
    return (
      <div>
        Loading...
      </div>
    );
  // TODO add errormodal popup or snackbar
  if (errMsg) {
    return (
      <div>
        {errMsg};
      </div>
    )
  }

  const doc = data?.getDocumentById;


  const onClickSave = (e) => {
    e.preventDefault();
    setCompleted(false);
    // TODO error check....
    const name = document.getElementById('file-name')?.value;
    const file = document.getElementById('lala-input')?.value;
    const id = doc._id;
    const date = new Date();
    const variables = {name, file, date, id};
    saveDoc({variables});
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
      <div align={'center'}>
        <br/>
        <br/>
        <Input
          id={'file-name'}
          defaultValue={doc.name}
          autoComplete={'off'}
          size={'md'}
          style={{
            height: '100%',
            backgroundColor: 'black',
            color: 'white',
            width: `${doc.name.length + 3}rem`
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
          {doc.date}
        </cite>
      </div>
      <div className="document">
        {/* Text editor */}
        <span className="text-editor" style={{paddingLeft: '0.5rem'}}>
          <Textarea
            // slotProps={{ textarea: {height: '100vh' } }}
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
        {/* Terminal */}
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
    </>
  )
}