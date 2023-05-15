const database = require("../models");
const AuthController = require("../controllers/auth.js");

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

  // static async getPost(req, res, id) {
  //   try {
  //     const { postId } = req.body;

  //     const post = await database.Post.findOne({
  //       where: { id: postId },
  //       include: {
  //         model: database.User,
  //         attributes: ["id", "firstName", "lastName", "email"],
  //       },
  //     });

  //     return post || res.status(200).json(post);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

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
        include: {
          model: database.User,
          attributes: ["id", "firstName", "lastName", "email"],
        },
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
}

module.exports = FeedController;
