import {gql} from '@apollo/client';

export const QUICKDATA = gql`
  query getQuickData {
    getQuickDataFromUser {
      _id
      name
      type
      date
    }
  }
`;

export const GETDOC = gql`
  query getDocument($id: String!) {
    getDocumentById(_id: $id) {
      _id
      file
      name
      date
    }
  }
`;

export const GETNB = gql`
  query getNotebook($id: String!) {
    getNotebookById(_id: $id) {
      _id
      name
      pairs {
        input
        output
      }
      date
    }
  }
`;

export const USERDOCS = gql`
  query getUserDocs {
    getUserDocuments {
      _id
      name
      file
      date
    }
  }  
`;

export const USERNBS = gql`
  query getUserNBs {
    getUserNotebooks {
      _id
      name
      date
    }
  }
`;

export const NEWDOC = gql`
  mutation newDoc($name: String!) {
    newDocument(name: $name) {
      _id
      name
      file
      date
    }
  }
`;

export const NEWNB = gql`
  mutation newNB($name: String!) {
    newNotebook(name: $name) {
      _id
      name
      pairs {
        input
        output
      }
      date
    }
  }
`;

export const UPDATEDOC = gql`
  mutation updateDoc($id: String!, $name: String, $file: String) {
    updateDocument(_id: $id, name: $name, file: $file){
      _id
      file
      name
      date
    }
  }
`;

export const UPDATENB = gql`
  mutation updateNB($id: String!, $name: String, $pairs: [PairInput]) {
    updateNotebook(_id: $id, name: $name, pairs: $pairs) {
      _id
      name
      pairs {
        input
        output
      }
      date
    }
  }
`;

export const UPDATECELLS = gql`
  mutation updateCells($id: String!, $name: String, $indices: [Int], $pairs: [PairInput]) {
    updateSpecificCells(_id: $id, name: $name, indices: $indices, pairs: $pairs) {
      _id
      name
      pairs {
        input
        output
      }
      date
    }
  }
`;

export const DELDOC = gql`
  mutation deleteDoc($id: String!) {
    removeDocument(_id: $id) {
      _id
      name
    }
  }  
`;

export const DELNB = gql`
  mutation deleteNB($id: String!) {
    removeNotebook(_id: $id) {
      _id
      name
    }
  }
`;