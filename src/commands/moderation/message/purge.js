const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @tipo {importar("@estructuras/Comando")}
 */
module.exports = {
  name: "purge",
  description: "elimina la cantidad especificada de mensajes",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "<amount>",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const amount = args[0];

    if (isNaN(amount)) return message.safeReply("Numbers are only allowed");
    if (parseInt(amount) > 99) return message.safeReply("La cantidad máxima de mensajes que puedo eliminar es 99.");

    const { channel } = message;
    const response = await purgeMessages(message.member, channel, "ALL", amount);

    if (typeof response === "number") {
      return channel.safeSend(`Eliminado exitosamente ${response} mensajes`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("no tengo `Read Message History` & `Manage Messages` para borrar mensajes", 5);
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("no tienes `Read Message History` & `Manage Messages` para borrar mensajes", 5);
    } else if (response === "NO_MESSAGES") {
      return channel.safeSend("No se encontraron mensajes que puedan limpiarse", 5);
    } else {
      return message.safeReply(`Error occurred! Failed para borrar mensajes`);
    }
  },
};
