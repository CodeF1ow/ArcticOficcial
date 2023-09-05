/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "Debe proporcionar un ID de mensaje válido.";

  // Permisos
  if (!member.permissions.has("ManageMessages")) {
    return "Debe tener permisos de gestionar mensajes para iniciar sorteos.";
  }

  // Buscar con el messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // Si no se encontró un sorteo
  if (!giveaway) return `No se pudo encontrar un sorteo para el ID de mensaje: ${messageId}`;

  // Comprobar si el sorteo ha terminado
  if (!giveaway.ended) return "El sorteo aún no ha terminado.";

  try {
    await giveaway.reroll();
    return "¡Sorteo rehecho!";
  } catch (error) {
    member.client.logger.error("Rehacer Sorteo", error);
    return `Ocurrió un error al rehacer el sorteo: ${error.message}`;
  }
};