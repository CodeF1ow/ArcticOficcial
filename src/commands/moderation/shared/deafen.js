const { deafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await deafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} esta ensordecido en este servidor`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para ensordecer ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `no tengo permiso para ensordecer ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  if (response === "ALREADY_DEAFENED") {
    return `${target.user.username} ya esta ensordecido`;
  }
  return `No pudo ensordecer ${target.user.username}`;
};
