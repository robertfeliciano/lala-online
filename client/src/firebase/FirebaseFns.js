import {
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';

const doGoogleSignIn = async () =>  {
  let auth = getAuth();
  let socialProvider = new GoogleAuthProvider();
  await signInWithPopup(auth, socialProvider);
}

const doGithubSigIn = async () => {
  let auth = getAuth();
  let socialProvider = new GithubAuthProvider();
  await signInWithPopup(auth, socialProvider);
}

const doSignOut = async () => {
  let auth = getAuth();
  await signOut(auth);
}

export {
  doSignOut,
  doGithubSigIn,
  doGoogleSignIn
}