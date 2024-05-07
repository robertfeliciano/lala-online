import {useQuery} from "@apollo/client";
import {USERNBS} from '../queries.js'
import {useState} from "react";
import {NavLink} from "react-router-dom";
import Grid from "@mui/joy/Grid";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";

export const Notebooks = () => {
  const [errMsg, setErrMsg] = useState('');
  const {loading, data} = useQuery(USERNBS, {
    onError: (e) => setErrMsg(e.message),
    fetchPolicy: 'cache-first'
  });

  if (loading)
    return <div style={{marginTop: '8rem'}}>Loading notebooks...</div>

  const nbs = data?.getUserNotebooks;

  return (
    <>
      <h1 style={{marginTop: '8rem'}}>Your Notebooks</h1>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 8}}
        sx={{
          flexGrow: 1,
          width: '100%',
          paddingLeft: '20px'
        }}
        justifyContent="center"
      >
        {
          nbs.map((nb, idx) => {
            return (
              <Grid xs={2} key={idx}>
                <NavLink to={`/notebooks/${nb._id}`}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: 'black',
                    }}
                  >
                    <CardContent>
                      <Typography
                        level="title-md"
                        sx={{
                          color: 'white'
                        }}
                      >
                        {nb.name.length < 20 ? nb.name : `${nb.name.slice(0,17)}...`}
                      </Typography>
                      <Typography  sx={{color: 'grey'}}>
                        {nb.date}
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