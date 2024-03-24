import {ApolloServer} from '@apollo/server';
import {startStandaloneServer} from '@apollo/server/standalone';
import { readFileSync } from 'fs';

import {resolvers} from './resolvers.js';

// this can also be a glob pattern to match multiple files!
const typeDefs = readFileSync('./typedefs.graphql', { encoding: 'utf-8' });

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const {url} = await startStandaloneServer(server, {
  listen: {port: 4000}
});

console.log(`🚀  Server ready at: ${url}`);
