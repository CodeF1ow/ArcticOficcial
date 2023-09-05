/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "leaveserver",
  description: "dejar un servidor.",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<serverId>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args, data) {
    const input = args[0];
    const guild = message.client.guilds.cache.get(input);
    if (!guild) {
      return message.safeReply(
        `No se encontró ningún servidor. Proporcione una identificación de servidor válida.
        Puede utilizar ${data.prefix}findserver/${data.prefix}listservers para encontrar la identificación del servidor`
      );
    }

    const name = guild.name;
    try {
      await guild.leave();
      return message.safeReply(`Se fue con éxito \`${name}\``);
    } catch (err) {
      message.client.logger.error("GuildLeave", err);
      return message.safeReply(`No pude salir \`${name}\``);
    }
  },
};
