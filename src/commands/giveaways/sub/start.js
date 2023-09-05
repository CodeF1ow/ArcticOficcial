const { ChannelType } = require("discord.js");

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').GuildTextBasedChannel} giveawayChannel
 * @param {number} duration
 * @param {string} prize
 * @param {number} winners
 * @param {import('discord.js').User} [host]
 * @param {string[]} [allowedRoles]
 */
module.exports = async (member, giveawayChannel, duration, prize, winners, host, allowedRoles = []) => {
  try {
    if (!host) host = member.user;
    if (!member.permissions.has("ManageMessages")) {
      return "Necesitas tener los permisos para gestionar mensajes para comenzar sorteos.";
    }

    if (!giveawayChannel.type === ChannelType.GuildText) {
      return "Solo puedes comenzar sorteos en canales de texto.";
    }

    /**
     * @type {import("discord-giveaways").GiveawayStartOptions}
     */
    const options = {
      duration: duration,
      prize,
      winnerCount: winners,
      hostedBy: host,
      thumbnail: "https://i.imgur.com/DJuTuxs.png",
      messages: {
        giveaway: "🎉 **SORTEO** 🎉",
        giveawayEnded: "🎉 **SORTEO FINALIZADO** 🎉",
        inviteToParticipate: "Reacciona con 🎁 para participar",
        dropMessage: "Sé el primero en reaccionar con 🎁 para ganar!",
        hostedBy: `\nOrganizado por: ${host.username}`,
      },
    };

    if (allowedRoles.length > 0) {
      options.exemptMembers = (member) => !member.roles.cache.find((role) => allowedRoles.includes(role.id));
    }

    await member.client.giveawaysManager.start(giveawayChannel, options);
    return `Sorteo comenzado en ${giveawayChannel}`;
  } catch (error) {
    member.client.logger.error("Comienzo de Sorteo", error);
    return `Ocurrió un error al comenzar el sorteo: ${error.message}`;
  }
};