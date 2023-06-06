const database = require("../models");

class MessageController {
  static async createMessage(senderId, recipientId, content) {
    const message = await database.Message.create({
      content: content,
      senderId: senderId,
      recipientId: recipientId,
    });
    return message;
  }

  static async getMessages() {
    const messages = await database.Message.findAll();
    return messages;
  }
}

module.exports = MessageController;
