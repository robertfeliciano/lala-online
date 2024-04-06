import {useParams} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {GETDOC, UPDATEDOC} from "../queries";
import {useState} from "react";
import {Navbar} from "./Navbar";
import TextareaAutosize from 'react-textarea-autosize';

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

  return (<>
    {/*<Navbar />*/}
    <br/>

    <TextareaAutosize autoFocus defaultValue={doc.file} style={{height: "10rem", width: "50rem"}}/>
    <br/>


  </>);




}