import {useParams} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {GETDOC, QUICKDATA, UPDATEDOC, USERDOCS} from "../queries";
import {useState} from "react";
import {process_string} from '../wasm/lala_lib';
import {Delete} from './Delete'
import CircularProgress from "@mui/joy/CircularProgress";
import Textarea from '@mui/joy/Textarea';


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
      if (getUserDocuments)
        cache.writeQuery({
          query: USERDOCS,
          data: {
            getUserDocuments:
              getUserDocuments.map(doc => doc._id === updateDocument._id ?
                {
                  _id: updateDocument._id,
                  name: updateDocument.name,
                  type: 'document',
                  date: updateDocument.date
                } : doc)
          }
        });

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
    }
  });
  const [output, setOutput] = useState('');

  const runLala = (e) => {
    const input = document.getElementById('lala-input')?.value;
    if (!input) {
      setErrMsg('must provide some input to run!');
      return;
    }
    // TODO add time display to see how long process_string takes using performance.now()
    const interpreted = process_string(input);
    setOutput(interpreted);
  }

  if (loading)
    return (
      <div>
        Loading...
      </div>
    );
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
      <div className={'file-options'}>
        <button style={{marginRight: '0.5rem'}} onClick={onClickSave}>
          {completed ? "Save Document" : <CircularProgress variant={'soft'} color={'neutral'} thickness={1}/>}
        </button>
        <Delete
          type={'Document'}
          name={doc.name}
          id={doc._id}
        />
      </div>
      <div>
        <br/>
        <br/>
        <input id={'file-name'} defaultValue={doc.name} autoComplete={"off"}/>
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
            slotProps={{textarea: {id: 'lala-input'}}}
            // id={'lala-input'}
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
        </span>
      </div>
    </>
  )
}