import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { expressMiddleware } from '@apollo/server/express4';
import { getAuth } from "firebase-admin/auth";
import { ApolloServer } from '@apollo/server';
import {resolvers} from './resolvers.js';
import {typeDefs} from './typeDefs.js';
import {GraphQLError} from "graphql";
import admin from "firebase-admin";
import {config} from 'dotenv';
import express from "express";
import cors from "cors";
import http from "http";

config(); // get path to file from .env and load it into process.env.GOOGLE_CREDENTIALS

import fs from 'fs';

const data = await fs.promises.readFile(process.env.GOOGLE_CREDENTIALS, 'utf8');
const conf = JSON.parse(data)

const firebaseApp = initializeApp({
  // credential: applicationDefault()
  credential: admin.credential.cert(conf)
});

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

// all queries hit this first to get their fid
app.use(async (req, res, next) => {
  const token = req.headers.authorization || req.query.token || '';
  if (token) {
    try {
      const { uid } = await getAuth(firebaseApp).verifyIdToken(token, true);
      req.firebaseId = uid;
      return next();
    } catch (e) {
      console.error(e);
    }
  }

  next();
});

// all graphql queries will go here to add the fid to the ctx
app.use(
  '/api/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      if (req.firebaseId) {
        return {fid: req.firebaseId};
      }
      throw new GraphQLError('Unauthenticated', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 }
        }
      });
    }
}));

app.get('*', (_, res) => res.status(404).send('uh oh'))

httpServer.listen({ port: 4000 }, () => {
  console.log('Express online at http://localhost:4000/\n');
  console.log('Apollo 🚀 online at http://localhost:4000/api/graphql');
});
