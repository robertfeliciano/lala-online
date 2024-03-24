import {GraphQLScalarType, GraphQLError, Kind} from "graphql";
import {
  getDocumentById,
  getNotebookById,
  getQuickDataFromUser,
  getUserField,
  newDocument,
  newNotebook,
  parseDate,
  removeDocument,
  removeNotebook,
  updateDocument,
  updateNotebook,
  updateSpecificCells
} from "./src/data.js";

const tempFid = "123";

export const resolvers = {
  Query: {
    getDocumentById: (_, args, __) => getDocumentById(args._id),
    getNotebookById: (_, args, __) => getNotebookById(args._id),
    getQuickDataFromUser: (_, __, ctx) => getQuickDataFromUser(tempFid),
    getUserDocuments: (_, __, ctx) => getUserField(tempFid, 'documents'),
    getUserNotebooks: (_, __, ctx) => getUserField(tempFid, 'notebooks'),
  },
  Mutation: {
    newDocument: (_, __, ctx) => newDocument(tempFid),
    newNotebook: (_, __, ctx) => newNotebook(tempFid),
    updateDocument: (_, args, ctx) => updateDocument(tempFid, args._id, args.name, args.file),
    updateNotebook: (_, args, ctx) => updateNotebook(tempFid, args._id, args.name, args.pairs),
    updateSpecificCells: (_, args, ctx) =>
      updateSpecificCells(tempFid, args._id, args.name, args.indices, args.pairs),
    removeDocument: (_, args, ctx) => removeDocument(tempFid, args._id),
    removeNotebook: (_, args, ctx) => removeNotebook(tempFid, args._id)
  },
  // Pair: {
  //
  // },
  // Document: {
  //
  // },
  // Notebook: {
  //
  // },
  // QuickData: {
  //
  // },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize (value) {
      if (typeof value === 'string')
        value = new Date(value)

      if (!(value instanceof Date))
        throw new GraphQLError('Must provide a valid date.', {
          extensions: {code: 'BAD_USER_INPUT'}
        });
      // should get a date object and convert it to a string
      const m = value.getMonth() + 1; // zero indexed so + 1
      const d = value.getDate();
      const yyyy = value.getFullYear();
      return `${m}/${d}/${yyyy}`;
    },
    parseValue(value) {
      if (typeof value !== 'string')
        throw new GraphQLError('Provided value is not a string', {
          extensions: {code: 'BAD_USER_INPUT'}
        });
      try {
        return parseDate(value);
      } catch(e) {
        throw new GraphQLError(e, {
          extensions: {code: 'BAD_USER_INPUT'}
        });
      }
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        try {
          return parseDate(ast.value);
        } catch(e) {
          throw new GraphQLError(e, {
            extensions: {code: 'BAD_USER_INPUT'}
          });
        }
      }
      throw new GraphQLError('Provided value is not a string', {
        extensions: {code: 'BAD_USER_INPUT'}
      });
    }
  })
};