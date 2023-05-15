const database = require("../models/index.js");
const FeedController = require("../controllers/feed.js");
const AuthController = require("../controllers/auth.js");
const { ApolloError } = require("apollo-server");
const isAuth = require("../middleware/isAuth");

const resolvers = {
  Query: {
    user: async (_, { id }) => {
      const user = await AuthController.getUser(id);
      if (!user) {
        throw notFoundError("No user found with id " + id);
      }
      return user;
    },

    users: async () => {
      const users = await AuthController.getUsers();
      if (!users) {
        throw notFoundError("No user found with id " + id);
      }
      return users;
    },

    profile: async (_, { id }) => {
      const profilePosts = await FeedController.profilePosts(id);
      return profilePosts;
    },

    post: async (_, { id }) => {
      const post = await FeedController.getPostById(id);
      if (!post) {
        throw notFoundError("No post found with id " + id);
      }
      return post;
    },

    posts: async () => {
      const posts = await FeedController.getPosts();
      return posts;
    },
  },

  Mutation: {
    createPost: async (
      _root,
      { input: { title, content, imageUrl } },
      { user }
    ) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }

      const post = await FeedController.createPost({
        userId: user.id,
        title,
        content,
        imageUrl,
      });
      return post;
    },

    deletePost: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const post = await FeedController.deletePost(id, user.id);

      if (!post) {
        throw notFoundError("Post not found");
      }
      return post;
    },

    updatePost: async (
      _root,
      { input: { id, title, content, imageUrl } },
      { user }
    ) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }

      const post = await FeedController.updatePost({
        id: id,
        userId: user.id,
        title,
        content,
        imageUrl,
      });

      if (!post) {
        throw notFoundError("Post not found");
      }
      return post;
    },
  },

  User: {
    posts: async ({ id }) => {
      const profilePosts = await FeedController.profilePosts(id);
      return profilePosts;
    },
  },
  Post: {
    user: (post) => {
      return post.User;
    },
  },
};

function notFoundError(message) {
  return new ApolloError(message, "NOT_FOUND");
}

function unauthorizedError(message) {
  return new ApolloError(message, "UNAUTHORIZED");
}
module.exports = resolvers;
