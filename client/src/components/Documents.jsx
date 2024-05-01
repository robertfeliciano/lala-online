import {useQuery} from "@apollo/client";
import {USERDOCS} from '../queries.js'
import {useState} from "react";
import {NavLink} from "react-router-dom";
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Grid from "@mui/joy/Grid";

export const Documents =  () => {
  const [errMsg, setErrMsg] = useState('');
  const {loading, data, error} = useQuery(USERDOCS, {
    onError: (e) => setErrMsg(e.message),
    fetchPolicy: 'cache-first'
  });

  if (errMsg || error)
    return <p style={{color: 'red'}}>{errMsg || error}</p>

  if (loading)
    return <div>Loading....</div>

  const docs = data?.getUserDocuments;

  return (
    <>
      <h1>Documents</h1>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 8}}
        sx={{ flexGrow: 1 }}
        justifyContent="center"
      >
        {
          docs.map((doc, idx) => {
            return (
              <Grid xs={2} key={idx}>
                <NavLink to={`/documents/${doc._id}`}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: 'black'
                    }}
                  >
                    <CardContent>
                      <Typography
                        level="title-md"
                        sx={{
                          color: 'white'
                        }}
                        >
                        {doc.name}
                      </Typography>
                      <Typography  sx={{color: 'grey'}}>
                        {doc.date}
                      </Typography>
                    </CardContent>
                  </Card>
                </NavLink>
              </Grid>
            )
          })
        }
      </Grid>
    </>
  )
}