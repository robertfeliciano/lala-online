import {useQuery} from "@apollo/client";
import {USERDOCS} from '../queries.js'
import {useState} from "react";
import {NavLink} from "react-router-dom";

export const Documents =  () => {
  const [errMsg, setErrMsg] = useState('');
  const {loading, data, error} = useQuery(USERDOCS, {
    onError: (e) => setErrMsg(e.message),
    fetchPolicy: 'cache-and-network'
  });

  if (errMsg || error)
    return <p style={{color: 'red'}}>{errMsg || error}</p>

  if (loading)
    return <div>Loading....</div>

  const docs = data?.getUserDocuments;

  return (
    <>
      <h1>Documents</h1>
      <div className={'home-select'}>
        {
          docs.map((doc, idx) => {
            return (
              <div key={idx}>
                <NavLink to={`/documents/${doc._id}`}>
                  <button
                    className={'hoverbtn'}
                    style={{
                      width: 200,
                      marginBottom: '0.75rem'
                  }}
                  >
                    <h2 style={{marginTop: 0}}>{doc.name}</h2>
                    <cite>
                      {doc.date}
                    </cite>
                    <p>
                      {doc.file.length > 15 ? `${doc.file.slice(0,15)}...` : doc.file}
                    </p>
                  </button>
                </NavLink>
              </div>
            )
          })
        }
      </div>
    </>
  )
}