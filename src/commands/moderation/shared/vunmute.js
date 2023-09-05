const { vUnmuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vUnmuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `La voz de ${target.user.username} no está silenciada en este servidor`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para activar el silencio por voz ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para activar el silencio por voz ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  if (response === "NOT_MUTED") {
    return `${target.user.username} no está silenciada la voz`;
  }
  return `No se pudo activar el silencio de la voz ${target.user.username}`;
};
