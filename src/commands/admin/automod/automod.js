const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "automod",
  description: "varias configuraciones de Automoderación",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "status",
        description: "muestra la configuración de automoderación actual del servidor",
      },
      {
        trigger: "strikes <number>",
        description: "número máximo de advertencias que un miembro puede recibir antes de que se tome una medida",
      },
      {
        trigger: "action <TIMEOUT|KICK|BAN>",
        description: "configura la acción a realizar después de recibir la cantidad máxima de advertencias",
      },
      {
        trigger: "debug <on|off>",
        description: "activa o desactiva la automoderación para los mensajes enviados por administradores y moderadores",
      },
      {
        trigger: "whitelist",
        description: "muestra la lista de canales añadidos a la lista blanca",
      },
      {
        trigger: "whitelistadd <channel>",
        description: "añade un canal a la lista blanca",
      },
      {
        trigger: "whitelistremove <channel>",
        description: "elimina un canal de la lista blanca",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "muestra la configuración de automoderación actual",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "strikes",
        description: "establece el número máximo de advertencias antes de que se tome una medida",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "número de advertencias (predeterminado 5)",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
      {
        name: "action",
        description: "configura la acción a realizar después de recibir la cantidad máxima de advertencias",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "action",
            description: "acción a realizar",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "TIMEOUT",
                value: "TIMEOUT",
              },
              {
                name: "KICK",
                value: "KICK",
              },
              {
                name: "BAN",
                value: "BAN",
              },
            ],
          },
        ],
      },
      {
        name: "debug",
        description: "activa/desactiva la automoderación para los mensajes enviados por administradores y moderadores",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "estado de la configuración",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "whitelist",
        description: "ver canales añadidos a la lista blanca",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "whitelistadd",
        description: "añade un canal a la lista blanca",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "canal a añadir",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "whitelistremove",
        description: "eliminar un canal de la lista blanca",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "canal a eliminar",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    const settings = data.settings;

    let response;
    if (input === "status") {
      response = await getStatus(settings, message.guild);
    } else if (input === "strikes") {
      const strikes = args[1];
      if (isNaN(strikes) || Number.parseInt(strikes) < 1) {
        return message.safeReply("El número de advertencias debe ser un número válido y mayor que 0");
      }
      response = await setStrikes(settings, strikes);
    } else if (input === "action") {
      const action = args[1].toUpperCase();
      if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
        return message.safeReply("Acción no válida. La acción puede ser `Timeout`/`Kick`/`Ban`");
      response = await setAction(settings, message.guild, action);
    } else if (input === "debug") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Estado inválido. El valor debe ser `on / off`");
      response = await setDebug(settings, status);
    }

    // whitelist
    else if (input === "whitelist") {
      response = getWhitelist(message.guild, settings);
    }

    // whitelist add
    else if (input === "whitelistadd") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`No se encontró un canal que coincida con ${ args[1] } `);
      response = await whiteListAdd(settings, match[0].id);
    }

    // whitelist remove
    else if (input === "whitelistremove") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`No se encontró un canal que coincida con ${ args[1] } `);
      response = await whiteListRemove(settings, match[0].id);
    }

    //
    else response = "Uso de comando inválido!";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;

    if (sub === "status") response = await getStatus(settings, interaction.guild);
    else if (sub === "strikes") response = await setStrikes(settings, interaction.options.getInteger("amount"));
    else if (sub === "action")
      response = await setAction(settings, interaction.guild, interaction.options.getString("action"));
    else if (sub === "debug") response = await setDebug(settings, interaction.options.getString("status"));
    else if (sub === "whitelist") {
      response = getWhitelist(interaction.guild, settings);
    } else if (sub === "whitelistadd") {
      const channelId = interaction.options.getChannel("channel").id;
      response = await whiteListAdd(settings, channelId);
    } else if (sub === "whitelistremove") {
      const channelId = interaction.options.getChannel("channel").id;
      response = await whiteListRemove(settings, channelId);
    }

    await interaction.followUp(response);
  },
};

async function getStatus(settings, guild) {
  const { automod } = settings;

  const logChannel = settings.modlog_channel
    ? guild.channels.cache.get(settings.modlog_channel).toString()
    : "No configurado";

  // String Builder
  let desc = stripIndent`
    ❯ ** Máximo de líneas **: ${ automod.max_lines || "NA" }
    ❯ ** Anti - Masmenpeo **: ${ automod.anti_massmention > 0 ? "✓" : "✕" }
    ❯ ** Anti - Adjunto **: ${ automod.anti_attachment ? "✓" : "✕" }
    ❯ ** Anti - Links **: ${ automod.anti_links ? "✓" : "✕" }
    ❯ ** Anti - Invitaciones **: ${ automod.anti_invites ? "✓" : "✕" }
    ❯ ** Anti - Spam **: ${ automod.anti_spam ? "✓" : "✕" }
    ❯ ** Anti - Ghostping **: ${ automod.anti_ghostping ? "✓" : "✕" }
`;

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Configuración de Automod", iconURL: guild.iconURL() })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addFields(
      {
        name: "Canal de Log",
        value: logChannel,
        inline: true,
      },
      {
        name: "Máximo de Advertencias",
        value: automod.strikes.toString(),
        inline: true,
      },
      {
        name: "Acción",
        value: automod.action,
        inline: true,
      },
      {
        name: "Debug",
        value: automod.debug ? "✓" : "✕",
        inline: true,
      }
    );

  return { embeds: [embed] };
}

async function setStrikes(settings, strikes) {
  settings.automod.strikes = strikes;
  await settings.save();
  return `Configuración guardada! El número máximo de advertencias es ${ strikes } `;
}

async function setAction(settings, guild, action) {
  if (action === "TIMEOUT") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return "No tengo permiso para hacer Timeouts a los miembros";
    }
  }

  if (action === "KICK") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return "No tengo permiso para expulsar miembros";
    }
  }

  if (action === "BAN") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return "No tengo permiso para banear miembros";
    }
  }

  settings.automod.action = action;
  await settings.save();
  return `Configuración guardada! La acción de Automod se ha fijado en ${ action } `;
}

async function setDebug(settings, input) {
  const status = input.toLowerCase() === "on" ? true : false;
  settings.automod.debug = status;
  await settings.save();
  return `Configuración guardada! El modo Debug de Automod ahora está ${ status ? "activado" : "desactivado" } `;
}

function getWhitelist(guild, settings) {
  const whitelist = settings.automod.wh_channels;
  if (!whitelist || !whitelist.length) return "No hay canales añadidos a la lista blanca";

  const channels = [];
  for (const channelId of whitelist) {
    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;
    if (channel) channels.push(channel.toString());
  }

  return `Canales en lista blanca: ${ channels.join(", ") } `;
}

async function whiteListAdd(settings, channelId) {
  if (settings.automod.wh_channels.includes(channelId)) return "El canal ya está en la lista blanca";
  settings.automod.wh_channels.push(channelId);
  await settings.save();
  return `Canal añadido a la lista blanca!`;
}

async function whiteListRemove(settings, channelId) {
  if (!settings.automod.wh_channels.includes(channelId)) return "El canal no está en la lista blanca";
  settings.automod.wh_channels.splice(settings.automod.wh_channels.indexOf(channelId), 1);
  await settings.save();
  return `Canal eliminado de la lista blanca!`;
}
