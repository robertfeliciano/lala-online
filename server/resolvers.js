import {GraphQLScalarType, GraphQLError, Kind} from "graphql";

export const resolvers = {
  Query: {

  },
  Mutation: {
    
  },
  User: {

  },
  Project: {

  },
  Notebook: {

  },
  QuickData: {

  },
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
        return date.parseDate(value);
      } catch(e) {
        throw new GraphQLError(e, {
          extensions: {code: 'BAD_USER_INPUT'}
        });
      }
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        try {
          return date.parseDate(ast.value);
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