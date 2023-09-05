const { isHex } = require("@helpers/Utils");
const { buildGreeting } = require("@handlers/greeting");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "farewell",
  description: "configura el mensaje de despedida",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "activar o desactivar el mensaje de despedida",
      },
      {
        trigger: "channel <#channel>",
        description: "configurar el canal de despedida",
      },
      {
        trigger: "preview",
        description: "previsualizar el mensaje de despedida configurado",
      },
      {
        trigger: "desc <texto>",
        description: "establecer la descripción del mensaje incrustado",
      },
      {
        trigger: "thumbnail <ON|OFF>",
        description: "habilitar o deshabilitar la miniatura de la imagen en el mensaje incrustado",
      },
      {
        trigger: "color <hexcolor>",
        description: "establecer el color del mensaje incrustado",
      },
      {
        trigger: "footer <texto>",
        description: "establecer el contenido del footer del mensaje incrustado",
      },
      {
        trigger: "image <url>",
        description: "establecer la imagen del mensaje incrustado",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "activar o desactivar el mensaje de despedida",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "activar o desactivar",
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
        name: "preview",
        description: "previsualización del mensaje de despedida configurado",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "channel",
        description: "establecer canal de despedida",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "nombre del canal",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "desc",
        description: "establecer la descripción del mensaje incrustado",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "content",
            description: "contenido de la descripción",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "thumbnail",
        description: "configurar la miniatura en el mensaje incrustado",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "activar o desactivar la miniatura",
            type: ApplicationCommandOptionType.String,
            required: true,
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
        name: "color",
        description: "establecer el color del mensaje incrustado",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "hex-code",
            description: "código de color hex",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "footer",
        description: "establecer el footer del mensaje incrustado",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "content",
            description: "contenido del footer",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "image",
        description: "establecer la imagen del mensaje incrustado",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "url",
            description: "URL de la imagen",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const settings = data.settings;
    let response;

    // preview
    if (type === "preview") {
      response = await sendPreview(settings, message.member);
    }

    // status
    else if (type === "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Estado inválido. El valor debe ser `on / off`");
      response = await setStatus(settings, status);
    }

    // channel
    else if (type === "channel") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel);
    }

    // desc
    else if (type === "desc") {
      if (args.length < 2) return message.safeReply("Argumentos insuficientes! Proporciona contenido válido");
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc);
    }

    // thumbnail
    else if (type === "thumbnail") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Estado inválido. El valor debe ser `on / off`");
      response = await setThumbnail(settings, status);
    }

    // color
    else if (type === "color") {
      const color = args[1];
      if (!color || !isHex(color)) return message.safeReply("Color inválido. El valor debe ser un color hex válido");
      response = await setColor(settings, color);
    }

    // footer
    else if (type === "footer") {
      if (args.length < 2) return message.safeReply("Argumentos insuficientes! Proporciona contenido válido");
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content);
    }

    // image
    else if (type === "image") {
      const url = args[1];
      if (!url) return message.safeReply("URL de imagen inválida. Proporciona un URL de imagen válido");
      response = await setImage(settings, url);
    }

    //
    else response = "Uso de comando inválido!";
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    switch (sub) {
      case "preview":
        response = await sendPreview(settings, interaction.member);
        break;

      case "status":
        response = await setStatus(settings, interaction.options.getString("status"));
        break;

      case "channel":
        response = await setChannel(settings, interaction.options.getChannel("channel"));
        break;

      case "desc":
        response = await setDescription(settings, interaction.options.getString("content"));
        break;

      case "thumbnail":
        response = await setThumbnail(settings, interaction.options.getString("status"));
        break;

      case "color":
        response = await setColor(settings, interaction.options.getString("hex-code"));
        break;

      case "footer":
        response = await setFooter(settings, interaction.options.getString("content"));
        break;

      case "image":
        response = await setImage(settings, interaction.options.getString("url"));
        break;

      default:
        response = "Subcomando inválido";
    }

    return interaction.followUp(response);
  },
};

async function sendPreview(settings, member) {
  if (!settings.farewell?.enabled) return "Mensaje de despedida no activado en este servidor";

  const targetChannel = member.guild.channels.cache.get(settings.farewell.channel);
  if (!targetChannel) return "No se ha configurado ningún canal para enviar mensaje de despedida";

  const response = await buildGreeting(member, "FAREWELL", settings.farewell);
  await targetChannel.safeSend(response);

  return `Previsualización de despedida enviada al canal ${ targetChannel.toString() } `;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.farewell.enabled = enabled;
  await settings.save();
  return `Configuración guardada! El mensaje de despedida ${ status ? "habilitado" : "desactivado" } `;
}

async function setChannel(settings, channel) {
  if (!channel.canSendEmbeds()) {
    return (
      "Uy! No puedo enviar la despedida a ese canal. Necesito el permiso `Escribir Mensajes` y `Insertar Links` en " +
      channel.toString()
    );
  }
  settings.farewell.channel = channel.id;
  await settings.save();
  return `Configuración guardada! El mensaje de despedida se enviará a ${ channel ? channel.toString() : "No encontrado" } `;
}

async function setDescription(settings, desc) {
  settings.farewell.embed.description = desc;
  await settings.save();
  return "Configuración guardada! El mensaje de despedida se ha actualizado";
}

async function setThumbnail(settings, status) {
  settings.farewell.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
  await settings.save();
  return "Configuración guardada! El mensaje de despedida se ha actualizado";
}

async function setColor(settings, color) {
  settings.farewell.embed.color = color;
  await settings.save();
  return "Configuración guardada! El mensaje de despedida se ha actualizado";
}

async function setFooter(settings, content) {
  settings.farewell.embed.footer = content;
  await settings.save();
  return "Configuración guardada! El mensaje de despedida se ha actualizado";
}

async function setImage(settings, url) {
  settings.farewell.embed.image = url;
  await settings.save();
  return "Configuración guardada! El mensaje de despedida se ha actualizado";
}