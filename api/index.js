const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");
const { readFile } = require("node:fs/promises");
const cors = require("cors");
const resolvers = require("./graphql/resolver.js");
const routes = require("./routes/routes.js");
const { expressjwt } = require("express-jwt");
const AuthController = require("./controllers/auth.js");

const app = express();
app.use(cors(), express.json());

routes(app);

async function getContext({ req }) {
  if (req.auth) {
    const user = await AuthController.getUser(req.auth.id);
    return { user };
  }
  return {};
}

async function startServer() {
  const typeDefs = await readFile("./api/graphql/schema.graphql", "utf8");

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(
    "/graphql",
    authMiddleware,
    expressMiddleware(server, { context: getContext })
  );

  app.listen(8080, () => {
    console.log(`🚀 Server ready at http://localhost:8080`);
  });
}

startServer();
