import {useParams} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {GETDOC, UPDATEDOC} from "../queries";
import {useState} from "react";
import {process_string} from '../wasm/lala_lib';

export const Document = () => {
  const {id} = useParams();
  const [errMsg, setErrMsg] = useState('');
  const {loading, error, data} = useQuery(GETDOC, {
      variables: {id},
      onError: (e) => setErrMsg(e.message),
      fetchPolicy: 'cache-and-network'
  });
  const [saveDoc] = useMutation(UPDATEDOC, {
    onError: (e) => setErrMsg(e.message)
  });
  const [output, setOutput] = useState('');

  const runLala = (e) => {
    const input = document.getElementById('lala-input')?.value;
    if (!input) {
      setErrMsg('must provide some input to run!');
      return;
    }
    const interpreted = process_string(input);
    setOutput(interpreted);
  }

  if (loading)
    return (
      <div>
        Loading...
      </div>
    );
  if (errMsg || error)
    return (
      <div>
        {error.message || errMsg};
      </div>
    )

  const doc = data?.getDocumentById;

  return (
    <>
      <br/>
      <div className={'file-options'}>
        <button style={{marginRight: '0.5rem'}}>
          Save Document
        </button>
        <button style={{marginLeft: '0.5rem'}}>
          Delete Document
        </button>
      </div>
      <div>
        <h1>
          {doc.name}
        </h1>
        <cite>
          {doc.date}
        </cite>
      </div>
      <div className="document">
        {/* Text editor */}
        <span className="text-editor">
          <textarea id={'lala-input'} defaultValue={doc.file}></textarea>
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