const { warnTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "warn",
  description: "advierte al miembro especificado",
  category: "MODERATION",
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> [razón]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "el miembro objetivo",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "motivo para advertir",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No se encontró ningún usuario que coincida ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await warn(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await warn(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

async function warn(issuer, target, reason) {
  const response = await warnTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.user.username} is warned!`;
  if (response === "BOT_PERM") return `No tengo permiso para avisar ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `No tienes permiso para avisar ${target.user.username}`;
  else return `No se pudo advertir ${target.user.username}`;
}