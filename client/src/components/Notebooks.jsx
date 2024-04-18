import {useQuery} from "@apollo/client";
import {USERNBS} from '../queries.js'
import {useState} from "react";
import {NavLink} from "react-router-dom";

export const Notebooks = () => {
  const [errMsg, setErrMsg] = useState('');
  const {loading, data, error} = useQuery(USERNBS, {
    onError: (e) => setErrMsg(e.message),
    fetchPolicy: 'cache-and-network'
  });

  if (errMsg || error)
    return <p style={{color: 'red'}}>{errMsg || error}</p>

  if (loading)
    return <div>Loading....</div>

  const nbs = data?.getUserNotebooks;

  const widths = nbs.map(nb => nb.name.length);

  return (
    <>
      <h1>Notebooks</h1>
      <div className={'home-select'}>
        {
          nbs.map((nb, idx) => {
            return (
              <div key={idx}>
                <NavLink to={`/notebooks/${nb._id}`}>
                  <button
                    className={'hoverbtn'}
                    style={{
                      width: Math.max(...widths) + 150,
                      marginBottom: '0.75rem'
                    }}
                  >
                    {nb.name}
                    <br/>
                    <cite>
                      {nb.date}
                    </cite>
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