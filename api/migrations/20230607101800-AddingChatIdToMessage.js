"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Messages", "chatId", {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: uuidv4(),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Messages", "chatId");
  },
};
