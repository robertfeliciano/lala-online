import {gql} from '@apollo/client';

const QUICKDATA = gql`
  query getQuickData {
    getQuickDataFromUser {
      _id
      name
      type
      date
    }
  }
`;

let exported = {
  QUICKDATA
};

export default exported;