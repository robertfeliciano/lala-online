import {
  getAuth,
  signOut,
  signInWithPopup,
  signInWithRedirect,
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
  await signInWithRedirect(auth, socialProvider);
}

const doSignOut = async (client) => {
  await client.clearStore();
  let auth = getAuth();
  await signOut(auth);
}

export {
  doSignOut,
  doGithubSigIn,
  doGoogleSignIn
}