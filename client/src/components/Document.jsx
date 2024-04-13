import {useParams} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {GETDOC, UPDATEDOC} from "../queries";
import {useEffect, useState} from "react";
import TextareaAutosize from 'react-textarea-autosize';
import {process_string} from '../wasm/lala_lib';
import { useContext } from "react";

export const Document = () => {


  const {id} = useParams();
  const [errMsg, setErrMsg] = useState('');
  const {loading, error, data} = useQuery(GETDOC, {
      variables: {id},
      onError: (e) => setErrMsg(e.message)
  });
  const [saveDoc] = useMutation(UPDATEDOC, {
    onError: (e) => setErrMsg(e.message)
  });
  const [output, setOutput] = useState('');


  // useEffect(() => {
  //   setFile({ name: data?.getDocumentById?.name || '', date: 'test' });
  // }, [data]);

  const runLala = (e) => {
    const input = document.getElementById('lala-input')?.value;
    if (!input) {
      setErrMsg('must provide some input to run!');
      return;
    }
    const interpreted = process_string(input);
    console.log(interpreted)
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
      <button>Save</button>
      <button>Delete</button>
      {/*<div>*/}
        <h1>
          {doc.name}
        </h1>
        <cite>
          {doc.date}
        </cite>
      {/*</div>*/}
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