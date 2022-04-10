//Apollo Calls
const { ApolloServer } = require('apollo-server-express');
const { typeDefs , resolvers } = require('./schema');
const { authMiddleware } = require('./utils/auth');

const startUp = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });
  await server.start();
  server.applyMiddleware({ app });
  console.log('Go to https://localhost:${PORT}${server.graphqlPath} to view the backend information!')
}

startUp();

//Express
const express = require('express');
const path = require('path');
const db = require('./config/connection');
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
