const database = require("../models");
const { v4: uuidv4 } = require("uuid");

class MessageController {
  static async createMessage({ senderId, recipientId, content, chatId }) {
    try {
      const message = await database.Message.create({
        content: content,
        senderId: senderId,
        recipientId: recipientId,
        chatId: chatId || uuidv4(),
      });
      return message;
    } catch (err) {
      console.log(err);
    }
  }

  static async deleteMessage(id) {
    const message = await database.Message.findOne({ where: { id: id } });
    await database.Message.destroy({ where: { id: id } });
    return { message: "Message deleted successfully" };
  }

  static async getMessages() {
    const messages = await database.Message.findAll();
    return messages;
  }

  static async findChatBetweenUsers(senderId, recipientId) {
    const chat = await database.Message.findOne({
      where: { senderId: senderId, recipientId: recipientId },
    });
    const sameChat = await database.Message.findOne({
      where: { senderId: recipientId, recipientId: senderId },
    });
    return chat || sameChat;
  }
}

module.exports = MessageController;
