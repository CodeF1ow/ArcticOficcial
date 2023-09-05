const botinvite = require("../shared/botinvite");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botinvite",
  description: "te da invitación bot",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = botinvite(message.client);
    try {
      await message.author.send(response);
      return message.safeReply("Compruebe su DM para mi información! :envelope_with_arrow:");
    } catch (ex) {
      return message.safeReply("No puedo enviarle mis datos! Su DM está abierto?");
    }
  },
};
