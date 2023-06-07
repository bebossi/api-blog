const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");
const { readFile } = require("node:fs/promises");
const cors = require("cors");
const resolvers = require("./graphql/resolver.js");
const routes = require("./routes/routes.js");
const { expressjwt } = require("express-jwt");
const AuthController = require("./controllers/auth.js");
const { createPostLoader } = require("./controllers/feed.js");
const { WebSocketServer } = require("ws");
const { createServer: createHttpServer } = require("node:http");
const { useServer: useWsServer } = require("graphql-ws/lib/use/ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const app = express();
app.use(cors(), express.json());

routes(app);

async function getContext({ req }) {
  const postLoader = createPostLoader();
  const context = { postLoader };
  if (req.auth) {
    context.user = await AuthController.getUser(req.auth.id);
  }

  return context;
}

async function startServer() {
  const typeDefs = await readFile("./api/graphql/schema.graphql", "utf8");

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use("/graphql", (req, res, next) => {
    if (
      (req.path === "/graphql" && req.method === "POST") ||
      (!req.headers.authorization &&
        req.method === "GET" &&
        req.query.operationName !== "userQuery")
    ) {
      // Exclude authentication middleware for GraphiQL POST requests and GET requests without Authorization header
      return next();
    }
    return authMiddleware(req, res, next);
  });
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  app.use("/graphql", expressMiddleware(server, { context: getContext }));

  const httpServer = createHttpServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  useWsServer({ schema }, wsServer);

  httpServer.listen(8080, () => {
    console.log(`🚀 Server ready at http://localhost:8080/graphql`);
  });
}

startServer();
