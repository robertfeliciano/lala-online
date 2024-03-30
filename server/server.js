import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import {GraphQLError} from "graphql";
import express from "express";
import cors from "cors";
import http from "http";

import {resolvers} from './resolvers.js';
import {typeDefs} from './typeDefs.js';

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

app.use(express.json());

// all queries hit this first to get their fid
app.use(async (req, res, next) => {
  // TODO remove true
  const token = req.headers.authorization || req.query.token || '' || true;
  if (token) {
    try {
      // TODO Uncomment this line and remove manual set of uid to "123"
      // const { uid } = await getAuth(firebaseApp).verifyIdToken(token, true);
      const uid = "123";
      req.firebaseId = uid;
      return next();
    } catch (e) {
      console.error(e);
    }
  }

  next();
});

// all graphql queries will go here to add the fid to the ctx
app.use('/api/graphql', cors(), expressMiddleware(server, {
  context: async ({ req }) => {
    if (req.firebaseId)
      return { fid: req.firebaseId };

    throw new GraphQLError('Unauthenticated', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 }
      }
    });
  }
}));

/**
 * TODO set up express app with sockets for real-time collaboration
 */

// app.post('/api/repl', async (req, res) => {
//   res.status(200).json({...req.body, output: "this is the output!!"});
// })

app.get('*', (_, res) => res.status(404).send('uh oh'))

httpServer.listen({ port: 4000 }, () => {
  console.log('Express online at http://localhost:4000/\n');
  console.log('Apollo 🚀 online at http://localhost:4000/api/graphql');
});
