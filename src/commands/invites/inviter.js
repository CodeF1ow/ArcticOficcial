const { getEffectiveInvites } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { stripIndent } = require("common-tags");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "inviter",
  description: "muestra información sobre el invitante",
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
        description: "para que el usuario obtenga la información del",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getInviter(message, target.user, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user") || interaction.user;
    const response = await getInviter(interaction, user, data.settings);
    await interaction.followUp(response);
  },
};

async function getInviter({ guild }, user, settings) {
  if (!settings.invite.tracking) return `El seguimiento de invitaciones está desactivado en este servidor`;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;
  if (!inviteData || !inviteData.inviter) return `No se puede rastrear cómo \`${user.username}\` joined`;

  const inviter = await guild.client.users.fetch(inviteData.inviter, false, true);
  const inviterData = (await getMember(guild.id, inviteData.inviter)).invite_data;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `Invitar datos para ${user.username}` })
    .setDescription(
      stripIndent`
      Inviter: \`${inviter?.username || "Usuario eliminado"}\`
      Inviter ID: \`${inviteData.inviter}\`
      Invite Code: \`${inviteData.code}\`
      Inviter Invites: \`${getEffectiveInvites(inviterData)}\`
      `
    );

  return { embeds: [embed] };
}
