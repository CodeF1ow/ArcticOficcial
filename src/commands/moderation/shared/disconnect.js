const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} está desconectado del canal de voz`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para desconectarte ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para desconectarme ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  return `No se pudo desconectar ${target.user.username}`;
};
