const { unDeafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await unDeafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} esta ensordecido en este servidor`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para ensordecer ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para ensordecer ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  if (response === "NOT_DEAFENED") {
    return `${target.user.username} no esta ensordecido`;
  }
  return `No pudo ensordecer ${target.user.username}`;
};
