const database = require("../models");

class FollowController {
  static async followUser(followerId, followingId) {
    try {
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
}
module.exports = FollowController;
