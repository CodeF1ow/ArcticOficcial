const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getBuffer } = require("@helpers/HttpUtils");
const { getImageFromMessage } = require("@helpers/BotUtils");
const { EMBED_COLORS, IMAGE } = require("@root/config.js");

const availableOverlays = [
  "approved",
  "brazzers",
  "gay",
  "halloween",
  "rejected",
  "thuglife",
  "to-be-continued",
  "wasted",
];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "overlay",
  description: "añade un filtro a la imagen proporcionada",
  cooldown: 5,
  category: "IMAGE",
  botPermissions: ["EmbedLinks", "AttachFiles"],
  command: {
    enabled: true,
    aliases: availableOverlays,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "name",
        description: "el tipo de filtro",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: availableOverlays.map((overlay) => ({ name: overlay, value: overlay })),
      },
      {
        name: "usuario",
        description: "la imagen del usuario para aplicar el filtro",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: "enlace",
        description: "el enlace de la imagen para aplicar el filtro",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const image = await getImageFromMessage(message, args);

    // utilizar el comando como endpoint
    const url = getOverlay(data.invoke.toLowerCase(), image);
    const response = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    });

    if (!response.success) return message.safeReply("No se pudo generar la imagen");

    const attachment = new AttachmentBuilder(response.buffer, { name: "attachment.png" });
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://attachment.png")
      .setFooter({ text: `Solicitado por: ${message.author.username}` });

    await message.safeReply({ embeds: [embed], files: [attachment] });
  },

  async interactionRun(interaction) {
    const author = interaction.user;
    const user = interaction.options.getUser("user");
    const imageLink = interaction.options.getString("link");
    const filter = interaction.options.getString("name");

    let image;
    if (user) image = user.displayAvatarURL({ size: 256, extension: "png" });
    if (!image && imageLink) image = imageLink;
    if (!image) image = author.displayAvatarURL({ size: 256, extension: "png" });

    const url = getOverlay(filter, image);
    const response = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    });

    if (!response.success) return interaction.followUp("No se pudo generar la imagen con filtro");

    const attachment = new AttachmentBuilder(response.buffer, { name: "attachment.png" });
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://attachment.png")
      .setFooter({ text: `Solicitado por: ${author.username}` });

    await interaction.followUp({ embeds: [embed], files: [attachment] });
  },
};

function getOverlay(filter, image) {
  const endpoint = new URL(`${IMAGE.BASE_API}/overlays/${filter}`);
  endpoint.searchParams.append("image", image);
  return endpoint.href;
}