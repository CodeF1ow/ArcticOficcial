const { getEffectiveInvites } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "invites",
  description: "muestra el número de invitaciones en este servidor",
  category: "INVITE",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "el usuario para recibir las invitaciones",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getInvites(message, target.user, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user") || interaction.user;
    const response = await getInvites(interaction, user, data.settings);
    await interaction.followUp(response);
  },
};

async function getInvites({ guild }, user, settings) {
  if (!settings.invite.tracking) return `El seguimiento de invitaciones está deshabilitado en este servidor`;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Invitaciones de ${user.username}` })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(user.displayAvatarURL())
    .setDescription(`${user.toString()} tiene ${getEffectiveInvites(inviteData)} invitaciones`)
    .addFields(
      {
        name: "Total Invitaciones",
        value: `**${inviteData?.tracked + inviteData?.added || 0}**`,
        inline: true,
      },
      {
        name: "Invitaciones Fake",
        value: `**${inviteData?.fake || 0}**`,
        inline: true,
      },
      {
        name: "Invitaciones Izquierdas",
        value: `**${inviteData?.left || 0}**`,
        inline: true,
      }
    );

  return { embeds: [embed] };
}
