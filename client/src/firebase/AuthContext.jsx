import React, {useState, useEffect} from 'react';
import {onAuthStateChanged} from 'firebase/auth';
import { useApolloClient } from '@apollo/client';
import auth from './FirebaseConfig.js';

export const AuthContext = React.createContext(null);

export const AuthProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const apolloClient = useApolloClient();

  useEffect(() => {
    if (currentUser)
      apolloClient.refetchQueries({
        include: [] // TODO add my queries
      });

    return auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoadingUser(false);
    });
  }, [apolloClient, currentUser]);

  if (loadingUser) {
    return (
      <div>
        <h1>Loading....Loading....Loading....Loading....Loading....</h1>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{currentUser}}>
      {children}
    </AuthContext.Provider>
  );
};
