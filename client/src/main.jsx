import ReactDOM from 'react-dom/client'
import App from './components/App.jsx'
import './styles/index.css'
import { AuthProvider } from './firebase/AuthContext.jsx';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import auth from './firebase/FirebaseConfig.js';

const GQL_BACKEND = import.meta.env.VITE_APP_BACKEND;

const httpLink = createHttpLink({
  uri: `${GQL_BACKEND}graphql`,
});

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
  <ApolloProvider client={client}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ApolloProvider>
)
