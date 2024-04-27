import {useContext} from 'react';
import Typography from '@mui/joy/Typography';
import GoogleLogo from '../assets/google-icon-logo.svg';
import GithubLogo from '../assets/github-mark.png';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import {doGoogleSignIn, doGithubSigIn} from "../firebase/FirebaseFns.js";
import {Navigate} from 'react-router-dom';
import {AuthContext} from './AuthContext';

const SocialButton = ({social, clickHandler}) => {
  const bgColor = social === 'Google' ? '#4285F4' : '#1d1b1b';
  return (
    <Button
      sx={{ p: 0 }}
      aria-label={`${social} sign in button`}
      style={{width: 225}}
      onClick={clickHandler}>
      <Card sx={{
        display: 'flex',
        p: 1,
        height: 30,
        alignItems: 'center',
        width: "210px"}}>
          <CardMedia
            component="img"
            sx={{ width: 35, height: 35, pr: 1}}
            image={social === "Google" ? GoogleLogo : GithubLogo}
            alt={`${social} logo`}
          />
          <CardContent sx={{
            flex: '1 0 auto',
            display: 'flex',
            alignItems: 'center',
            pt: 3.25,
            height: 30,
            justifyContent: 'center',
            backgroundColor: bgColor}}>
            <Typography component="div" variant="h5" sx={{color: '#FFFFFF'}}>
              {social === "Google" ? "Sign in With Google" : "Sign in with Github"}
            </Typography>
          </CardContent>
      </Card>
    </Button>
  );
}

const SocialSignIn = () => {
  const {currentUser} = useContext(AuthContext);
  if (currentUser) {
    return <Navigate to='/' />;
  }

  return (
    <div>
      <Typography component="div" variant="h4">
        Welcome to Lala Online.
      </Typography>
      <br/>
      <FormControl style={{alignItems: 'center'}}>
        <SocialButton social="Google" clickHandler={doGoogleSignIn}></SocialButton>
      </FormControl>
      <br/>
      <FormControl style={{alignItems: 'center'}}>
        <SocialButton social="Github" clickHandler={doGithubSigIn}></SocialButton>
      </FormControl>
    </div>
  );
}



export default SocialSignIn;