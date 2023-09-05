const vunmute = require("../shared/vunmute");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "vunmute",
  description: "reactiva la voz del miembro especificado",
  category: "MODERATION",
  userPermissions: ["MuteMembers"],
  botPermissions: ["MuteMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> [razón]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No se encontró ningún usuario que coincida ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await vunmute(message, target, reason);
    await message.safeReply(response);
  },
};
