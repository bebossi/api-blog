const database = require("../models");

class FollowController {
  static async followUser(followerId, followingId) {
    try {
      const existingFollow = await database.Follow.findOne({
        where: {
          followerId: followerId,
          followingId: followingId,
        },
      });

      if (existingFollow) {
        console.log("You already follow this user");
        return { success: false, message: "You already follow this user" };
      }

      const followUser = await database.Follow.create({
        followerId: followerId,
        followingId: followingId,
      });

      await database.User.increment("Following", { where: { id: followerId } });
      await database.User.increment("Followers", {
        where: { id: followingId },
      });

      console.log("Successfully followed user!");
      return followUser;
    } catch (err) {
      console.log(err);
      throw new Error("Failed to follow user");
    }
  }

  static async unfollowUser(followerId, followingId) {
    try {
      const unfollowUser = await database.Follow.findOne({
        where: { followerId: followerId, followingId: followingId },
      });

      await database.Follow.destroy({
        where: {
          followerId: followerId,
          followingId: followingId,
        },
      });

      await database.User.decrement("Following", { where: { id: followerId } });
      await database.User.decrement("Followers", {
        where: { id: followingId },
      });

      return {
        message: "Successfully unfollowed user",
      };
    } catch (err) {
      console.log(err);
      throw new Error("Failed to unfollow user");
    }
  }
}
module.exports = FollowController;
