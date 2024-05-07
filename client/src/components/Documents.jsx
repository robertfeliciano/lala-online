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
  const {loading, data} = useQuery(USERDOCS, {
    onError: (e) => setErrMsg(e.message),
    fetchPolicy: 'cache-first'
  });

  if (loading)
    return <div style={{marginTop: '8rem'}}>Loading documents...</div>

  const docs = data?.getUserDocuments;

  return (
    <>
      <h1 style={{marginTop: '8rem'}}>Your Documents</h1>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 8}}
        sx={{
          flexGrow: 1,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: '20px'
        }}
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
                        {doc.name.length < 20 ? doc.name : `${doc.name.slice(0,17)}...`}
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