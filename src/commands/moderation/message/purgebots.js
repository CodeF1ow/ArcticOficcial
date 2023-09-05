const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purgebots",
  description: "elimina la cantidad especificada de mensajes de los bots",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "[amount]",
    aliases: ["purgebot"],
  },

  async messageRun(message, args) {
    const amount = args[0] || 99;

    if (amount) {
      if (isNaN(amount)) return message.safeReply("Sólo se permiten números");
      if (parseInt(amount) > 99) return message.safeReply("La cantidad máxima de mensajes que puedo eliminar es 99.");
    }

    const { channel } = message;
    const response = await purgeMessages(message.member, message.channel, "BOT", amount);

    if (typeof response === "number") {
      return channel.safeSend(`Mensajes ${response} eliminados correctamente`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("No tengo `Read Message History` & `Manage Messages` para borrar mensajes", 5);
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("No tienes `Read Message History` & `Manage Messages` para borrar mensajes", 5);
    } else if (response === "NO_MESSAGES") {
      return channel.safeSend("No se encontraron mensajes que puedan limpiarse", 5);
    } else {
      return message.safeReply(`Se produjo un error! No se pudieron eliminar mensajes`);
    }
  },
};
