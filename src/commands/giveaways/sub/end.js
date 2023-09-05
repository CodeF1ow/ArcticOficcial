/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "Debe proporcionar un id de mensaje válido.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "Necesitas tener permisos de gestión de mensajes para iniciar sorteos..";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `No se puede encontrar un giveaway para messageId: ${messageId}`;

  // Check if the giveaway is ended
  if (giveaway.ended) return "El sorteo ya ha finalizado.";

  try {
    await giveaway.end();
    return "Éxito! El sorteo ha terminado!";
  } catch (error) {
    member.client.logger.error("Fin del sorteo", error);
    return `Se ha producido un error al finalizar el sorteo: ${error.message}`;
  }
};
