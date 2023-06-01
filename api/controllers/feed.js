const database = require("../models");
const AuthController = require("../controllers/auth.js");
const DataLoader = require("dataloader");
const { Op } = require("sequelize");

class FeedController {
  static async createPost({ userId, title, content, imageUrl }) {
    try {
      const post = await database.Post.create({
        userId: userId,
        title: title,
        content: content,
        imageUrl: imageUrl,
      });

      return post;
    } catch (err) {
      console.log(err);
    }
  }

  static async getPostById(id) {
    try {
      const post = await database.Post.findOne({
        where: { id },
        include: {
          model: database.User,
          attributes: ["id", "firstName", "lastName", "email"],
        },
      });

      return post;
    } catch (err) {
      console.log(err);
      throw new Error("Failed to fetch post.");
    }
  }

  static async getPosts(req, res) {
    try {
      const posts = await database.Post.findAll({
        include: [
          {
            model: database.User,
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: database.Comment,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return posts || res.status(200).json(posts);
    } catch (err) {
      console.log(err);
    }
  }

  static async profilePosts(id) {
    try {
      const user = await AuthController.getUser(id);

      const posts = await database.Post.findAll({
        where: { userId: id },
        include: {
          model: database.User,
          attributes: ["id", "firstName", "lastName", "email"],
        },
      });

      return posts;
    } catch (err) {
      console.log(err);
      throw new Error("Failed to fetch post.");
    }
  }

  static async updatePost({ id, title, content, imageUrl, userId }) {
    try {
      const newInfo = { title, content, imageUrl };
      await database.Post.update(newInfo, {
        where: { id: id, userId: userId },
      });

      const updatedpost = await database.Post.findOne({
        where: { id: id, userId: userId },
      });

      return updatedpost;
    } catch (err) {
      console.log(err);
    }
  }

  static async deletePost(id, userId) {
    try {
      const deletedPost = await database.Post.findOne({
        where: { id: id, userId: userId },
      });

      await database.Post.destroy({
        where: { id: id, userId: userId },
      });

      return deletedPost;
    } catch (err) {
      console.log(err);
    }
  }

  static async createComment({ comment, userId, postId }) {
    const CreatedComment = await database.Comment.create({
      comment: comment,
      userId: userId,
      postId: postId,
    });
    return CreatedComment;
  }

  static async updateComment({ comment, userId, postId, commentId }) {
    const newInfo = { comment };
    await database.Comment.update(newInfo, {
      where: { id: commentId },
    });

    const updatedpost = await database.Comment.findOne({
      where: { id: commentId },
    });

    return updatedpost;
  }

  static async getCommentsByPost({ postId }) {
    try {
      const post = await database.Post.findOne({
        where: { id: postId },
      });

      const comments = await database.Comment.findAll({
        where: { postId: postId },
      });

      return comments;
    } catch (err) {
      console.log(err);
    }
  }

  static postLoader = new DataLoader(async (ids) => {
    const posts = await database.Post.findAll({ where: { userId: ids } });
    return ids.map((id) => {
      return posts.filter((post) => post.userId === id);
    });
  });

  static async createPostLoader() {
    return new DataLoader(async (ids) => {
      const posts = await database.Post.findAll({ where: { userId: ids } });
      return ids.map((id) => {
        return posts.filter((post) => post.userId === id);
      });
    });
  }
}

module.exports = FeedController;
