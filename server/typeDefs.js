export const typeDefs = `#graphql
type Query {
  getDocumentById(_id: String!): Document!
  getNotebookById(_id: String!) : Notebook!
  getQuickDataFromUser: [QuickData!]!
  getUserDocuments: [Document!]!
  getUserNotebooks: [Notebook!]!
}

type Pair {
  input: String!
  output: String!
}

input PairInput {
  input: String!
  output: String!
}

type Mutation {
  newDocument(name: String!): Document!
  newNotebook(name: String!): Notebook!
  updateDocument(_id: String!, name: String, file: String): Document!
  updateNotebook(_id: String!, name: String, pairs: [PairInput]): Notebook!
  updateSpecificCells(_id: String!, name: String, indices: [Int], pairs: [PairInput]): Notebook!
  removeDocument(_id: String!): Document!
  removeNotebook(_id: String!): Notebook!
}

scalar Date

type QuickData {
  _id: String!
  name: String!
  type: String!
  date: Date!
}

type Document {
  _id: String!
  ownerFid: String!
  file: String!
  name: String!
  date: Date!
}

type Notebook {
  _id: String!
  ownerFid: String!
  name: String!
  pairs: [Pair]!
  date: Date!
}`