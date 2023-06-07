const database = require("../models/index.js");
const FeedController = require("../controllers/feed.js");
const AuthController = require("../controllers/auth.js");
const FollowController = require("../controllers/follow.js");
const MessageController = require("../controllers/message.js");
const { ApolloError } = require("apollo-server");
const isAuth = require("../middleware/isAuth");
const { PubSub } = require("graphql-subscriptions");
const { v4: uuidv4 } = require("uuid");

const pubSub = new PubSub();

const resolvers = {
  Query: {
    user: async (_root, { id }) => {
      const user = await AuthController.getUser(id);
      if (!user) {
        throw notFoundError("No user found with id " + id);
      }
      return user;
    },

    users: async () => {
      const users = await AuthController.getUsers();
      if (!users) {
        throw notFoundError("No user found with id ");
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

    messages: (_root, _args, { user }) => {
      if (!user) {
        throw unauthorizedError("No user");
      }
      const messages = MessageController.getMessages();
      return messages;
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

    createComment: async (_root, { input: { comment, postId } }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }

      const CreatedComment = await FeedController.createComment({
        userId: user.id,
        comment,
        postId: postId,
      });
      return CreatedComment;
    },

    updateComment: async (_root, { input: { id, comment } }, { user }) => {
      const updateComment = await FeedController.updateComment({
        id: id,
        comment: comment,
        userId: user.id,
      });
      return updateComment;
    },

    deleteComment: async (_root, { id, userId }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const comment = await FeedController.deleteComment(id, user.id);

      if (!comment) {
        throw notFoundError("Comment not found");
      }
      return comment;
    },

    followUser: async (_root, { followerId, followingId }, { user }) => {
      const followUser = await FollowController.followUser(
        user.id,
        followingId
      );
      return followUser;
    },

    unfollowUser: async (_root, { followerId, followingId }, { user }) => {
      const unfollowUser = await FollowController.unfollowUser(
        user.id,
        followingId
      );

      return {
        followerId: user.id,
        followingId: followingId,
        message: unfollowUser.message,
      };
    },

    addMessage: async (_root, { input }, { user }) => {
      if (!user) {
        throw unauthorizedError("No user");
      }

      const { recipientId, content } = input;

      const existingChat = await MessageController.findChatBetweenUsers(
        user.id,
        recipientId
      );

      let chatId;
      console.log(existingChat.chatId);

      if (existingChat) {
        chatId = existingChat.chatId;
      } else {
        chatId = uuidv4();
      }

      const message = await MessageController.createMessage({
        senderId: user.id,
        recipientId: recipientId,
        content,
        chatId: chatId,
      });
      pubSub.publish("MESSAGE_ADDED", { messageAdded: message });

      return message;
    },

    deleteMessage: async (_root, { id }, { user }) => {
      const deleteMessage = await MessageController.deleteMessage(id);
      return { deleteMessage, id };
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: () => pubSub.asyncIterator("MESSAGE_ADDED"),
    },
  },

  User: {
    posts: async (user, _args, { postLoader }) => {
      const posts = await FeedController.postLoader.load(user.id);
      return posts;
    },
  },
  Post: {
    user: (post) => {
      return post.User;
    },

    comments: async (post) => {
      const comments = await FeedController.getCommentsByPost({
        postId: post.id,
      });
      return comments;
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
