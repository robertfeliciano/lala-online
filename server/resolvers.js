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

export const resolvers = {
  Query: {
    getDocumentById: (_, args, __) => getDocumentById(args._id),
    getNotebookById: (_, args, __) => getNotebookById(args._id),
    getQuickDataFromUser: (_, __, ctx) => getQuickDataFromUser(ctx.fid),
    getUserDocuments: (_, __, ctx) => getUserField(ctx.fid, 'documents'),
    getUserNotebooks: (_, __, ctx) => getUserField(ctx.fid, 'notebooks'),
  },
  Mutation: {
    newDocument: (_, __, ctx) => newDocument(ctx.fid),
    newNotebook: (_, __, ctx) => newNotebook(ctx.fid),
    updateDocument: (_, args, ctx) => updateDocument(ctx.fid, args._id, args.name, args.file),
    updateNotebook: (_, args, ctx) => updateNotebook(ctx.fid, args._id, args.name, args.pairs),
    updateSpecificCells: (_, args, ctx) =>
      updateSpecificCells(ctx.fid, args._id, args.name, args.indices, args.pairs),
    removeDocument: (_, args, ctx) => removeDocument(ctx.fid, args._id),
    removeNotebook: (_, args, ctx) => removeNotebook(ctx.fid, args._id)
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