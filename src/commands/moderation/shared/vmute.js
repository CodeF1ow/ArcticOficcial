const { vMuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vMuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `La voz de ${target.user.username} está silenciada en este servidor`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para silenciar la voz ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para silenciar la voz ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  if (response === "ALREADY_MUTED") {
    return `${target.user.username} ya esta silenciado`;
  }
  return `No se pudo silenciar la voz ${target.user.username}`;
};
