import {doSignOut} from "../firebase/FirebaseFns.js";


export const Home = () => {
  return (
    <div>
      <button onClick={doSignOut}>Sign out</button>
      <h1>Hello!</h1>
    </div>
  )
}