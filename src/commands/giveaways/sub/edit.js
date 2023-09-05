/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 * @param {number} addDuration
 * @param {string} newPrize
 * @param {number} newWinnerCount
 */
module.exports = async (member, messageId, addDuration, newPrize, newWinnerCount) => {
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

  try {
    await member.client.giveawaysManager.edit(messageId, {
      addTime: addDuration || 0,
      newPrize: newPrize || giveaway.prize,
      newWinnerCount: newWinnerCount || giveaway.winnerCount,
    });

    return `¡Sorteo actualizado correctamente!`;
  } catch (error) {
    member.client.logger.error("Edición de Sorteo", error);
    return `Ocurrió un error al actualizar el sorteo: ${error.message}`;
  }
};