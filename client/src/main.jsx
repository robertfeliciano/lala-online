import ReactDOM from 'react-dom/client'
import App from './components/App'
import './styles/index.css'
import {BrowserRouter} from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import conf from './firebase/FirebaseConfig';
import {initializeApp} from 'firebase/app';
import {getAuth} from "firebase/auth";
// import FileProvider from "./components/FileContext.jsx";

const app = initializeApp(conf);

const GQL_BACKEND = import.meta.env.VITE_APP_BACKEND;

const httpLink = createHttpLink({
  uri: `${GQL_BACKEND}graphql`,
});

const auth = getAuth(app);

const authLink = setContext(async (_, { headers }) => {
  const token = await auth.currentUser?.getIdToken();
  // put auth token in headers so graphql backend can verify
  return {
    headers: {
      ...headers,
      authorization: token || ""
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <AuthProvider>
        {/*<FileProvider>*/}
          <App />
        {/*</FileProvider>*/}
      </AuthProvider>
    </ApolloProvider>
  </BrowserRouter>
)
