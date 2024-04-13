import {useParams} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {GETNB} from "../queries";
import {useState, useEffect, useRef} from "react";
import { io } from 'socket.io-client';
import TextareaAutosize from "react-textarea-autosize";


export const Notebook = () => {
  const {id} = useParams();
  const [errMsg, setErrMsg] = useState('');
  const {loading, error, data} = useQuery(GETNB, {
    variables: {id},
    onError: (e) => setErrMsg(e.message)
  });

  const socketRef = useRef();

  useEffect(() => {
    const endpt =  import.meta.env.VITE_KERNEL_ENDPOINT;
    socketRef.current = io(endpt);

    socketRef.current.on('output', (({output}) => console.log(output)));
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  if (loading || !socketRef.current)
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

  const runCell = () => {

  }


  const pingServer = () => {
    console.log('attempting to ping server');
    socketRef.current.emit('run', {cell_text:"let a = 1 0 0 ; 0 1 0 ; 0 0 1", auth: "123"});
  };
  pingServer();

  const nb = data?.getNotebookById;
  const cells = nb?.pairs;
  return (<>
    <div>
      <h1>
        {nb.name}
      </h1>
      <cite>
        {nb.date}
      </cite>
    </div>
    <br/>
    <br/>
    <br/>
    {
      cells.map(({input, output}, idx) => {
        return (
          <div key={idx}>
            <div>
              <TextareaAutosize
                defaultValue={input}
                minRows={6}
                aria-label={`input-${idx}`}
                style={{width: 500}}
              />
              <button onClick={runCell}>Run Cell</button>
            </div>
            <div>
              <label>Output: </label>
              {output}
            </div>
            <br/>
            <br/>
          </div>
        )
      })
    }

  </>)
}