/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "Debe proporcionar un ID de mensaje válido.";

  // Permisos
  if (!member.permissions.has("ManageMessages")) {
    return "Necesitas tener los permisos para gestionar mensajes para administrar sorteos.";
  }

  // Buscar mediante el ID del mensaje
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // Si no se encontró un sorteo
  if (!giveaway) return `Incapaz de encontrar un sorteo para el ID de mensaje: ${messageId}`;

  // Comprobar si el sorteo está pausado
  if (!giveaway.pauseOptions.isPaused) return "Este sorteo no está pausado.";

  try {
    await giveaway.unpause();
    return "Éxito! Sorteo despausado!";
  } catch (error) {
    member.client.logger.error("Reanudación de Sorteo", error);
    return `Ocurrió un error al despausar el sorteo: ${error.message}`;
  }
};