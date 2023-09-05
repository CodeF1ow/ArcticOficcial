/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "Debe proporcionar un id de mensaje válido.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "Necesitas tener los permisos de gestión de mensajes para gestionar regalos.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `No se puede encontrar un giveaway para messageId: ${messageId}`;

  // Check if the giveaway is paused
  if (giveaway.pauseOptions.isPaused) return "This giveaway is already paused.";

  try {
    await giveaway.pause();
    return "Éxito! Sorteo en pausa!";
  } catch (error) {
    member.client.logger.error("Sorteo pausado", error);
    return `Se ha producido un error al pausar el sorteo: ${error.message}`;
  }
};
