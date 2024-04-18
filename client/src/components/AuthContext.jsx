import React, {useState, useEffect} from 'react';
import { useApolloClient } from '@apollo/client';
import {getAuth, onAuthStateChanged} from "firebase/auth";

export const AuthContext = React.createContext(null);

export const AuthProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const apolloClient = useApolloClient();

  const auth = getAuth();
  useEffect(() => {
    // if (currentUser)
    //   apolloClient.refetchQueries({
    //     include: ['getQuickData', 'getUserDocs', 'getUserNBs']
    //   });
    let myListener = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingUser(false);
    });
    return () => {
      if (myListener) myListener();
    };
  }, [apolloClient]);

  if (loadingUser) {
    return (
      <div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{currentUser}}>
      {children}
    </AuthContext.Provider>
  );
};
