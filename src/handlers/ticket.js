const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  StringSelectMenuBuilder,
  ComponentType,
} = require("discord.js");
const { TICKET } = require("@root/config.js");

// schemas
const { getSettings } = require("@schemas/Guild");

// helpers
const { postToBin } = require("@helpers/HttpUtils");
const { error } = require("@helpers/Logger");

const OPEN_PERMS = ["ManageChannels"];
const CLOSE_PERMS = ["ManageChannels", "ReadMessageHistory"];

/**
 * @param {import('discord.js').Channel} channel
 */
function isTicketChannel(channel) {
  return (
    channel.type === ChannelType.GuildText &&
    channel.name.startsWith("tіcket-") &&
    channel.topic &&
    channel.topic.startsWith("tіcket|")
  );
}

/**
 * @param {import('discord.js').Guild} guild
 */
function getTicketChannels(guild) {
  return guild.channels.cache.filter((ch) => isTicketChannel(ch));
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} userId
 */
function getExistingTicketChannel(guild, userId) {
  const tktChannels = getTicketChannels(guild);
  return tktChannels.filter((ch) => ch.topic.split("|")[1] === userId).first();
}

/**
 * @param {import('discord.js').BaseGuildTextChannel} channel
 */
async function parseTicketDetails(channel) {
  if (!channel.topic) return;
  const split = channel.topic?.split("|");
  const userId = split[1];
  const catName = split[2] || "Default";
  const user = await channel.client.users.fetch(userId, { cache: false }).catch(() => { });
  return { user, catName };
}

/**
 * @param {import('discord.js').BaseGuildTextChannel} channel
 * @param {import('discord.js').User} closedBy
 * @param {string} [reason]
 */
async function closeTicket(channel, closedBy, reason) {
  if (!channel.deletable || !channel.permissionsFor(channel.guild.members.me).has(CLOSE_PERMS)) {
    return "MISSING_PERMISSIONS";
  }

  try {
    const config = await getSettings(channel.guild);
    const messages = await channel.messages.fetch();
    const reversed = Array.from(messages.values()).reverse();

    let content = "";
    reversed.forEach((m) => {
      content += `[${new Date(m.createdAt).toLocaleString("en-US")}] - ${m.author.username}\n`;
      if (m.cleanContent !== "") content += `${m.cleanContent}\n`;
      if (m.attachments.size > 0) content += `${m.attachments.map((att) => att.proxyURL).join(", ")}\n`;
      content += "\n";
    });

    const logsUrl = await postToBin(content, `Registros de tickets para ${channel.name}`);
    const ticketDetails = await parseTicketDetails(channel);

    const components = [];
    if (logsUrl) {
      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("Transcript").setURL(logsUrl.short).setStyle(ButtonStyle.Link)
        )
      );
    }

    if (channel.deletable) await channel.delete();

    const embed = new EmbedBuilder().setAuthor({ name: "Ticket Cerrado" }).setColor(TICKET.CLOSE_EMBED);
    const fields = [];

    if (reason) fields.push({ name: "Razón", value: reason, inline: false });
    fields.push(
      {
        name: "Abierto por",
        value: ticketDetails.user ? ticketDetails.user.username : "Unknown",
        inline: true,
      },
      {
        name: "Cerrado por",
        value: closedBy ? closedBy.username : "Unknown",
        inline: true,
      }
    );

    embed.setFields(fields);

    // send embed to log channel
    if (config.ticket.log_channel) {
      const logChannel = channel.guild.channels.cache.get(config.ticket.log_channel);
      logChannel.safeSend({ embeds: [embed], components });
    }

    // send embed to user
    if (ticketDetails.user) {
      const dmEmbed = embed
        .setDescription(`**Servidor:** ${channel.guild.name}\n**Categoría:** ${ticketDetails.catName}`)
        .setThumbnail(channel.guild.iconURL());
      ticketDetails.user.send({ embeds: [dmEmbed], components }).catch((ex) => { });
    }

    return "SUCCESS";
  } catch (ex) {
    error("closeTicket", ex);
    return "ERROR";
  }
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').User} author
 */
async function closeAllTickets(guild, author) {
  const channels = getTicketChannels(guild);
  let success = 0;
  let failed = 0;

  for (const ch of channels) {
    const status = await closeTicket(ch[1], author, "Forzar el cierre de todos los tickets abiertos");
    if (status === "SUCCESS") success += 1;
    else failed += 1;
  }

  return [success, failed];
}

/**
 * @param {import("discord.js").ButtonInteraction} interaction
 */
async function handleTicketOpen(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const { guild, user } = interaction;

  if (!guild.members.me.permissions.has(OPEN_PERMS))
    return interaction.followUp(
      "No se puede crear el canal de tickets, falta permiso `Manage Channel`. Póngase en contacto con el administrador del servidor para obtener ayuda!"
    );

  const alreadyExists = getExistingTicketChannel(guild, user.id);
  if (alreadyExists) return interaction.followUp(`Ya tienes un ticket abierto`);

  const settings = await getSettings(guild);

  // limit check
  const existing = getTicketChannels(guild).size;
  if (existing > settings.ticket.limit) return interaction.followUp("Hay demasiadas entradas abiertas. Vuelve a intentarlo más tarde");

  // check categories
  let catName = null;
  let catPerms = [];
  const categories = settings.ticket.categories;
  if (categories.length > 0) {
    const options = [];
    settings.ticket.categories.forEach((cat) => options.push({ label: cat.name, value: cat.name }));
    const menuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket-menu")
        .setPlaceholder("Elige la categoría de entrada")
        .addOptions(options)
    );

    await interaction.followUp({ content: "Por favor elige una categoría de entrada", components: [menuRow] });
    const res = await interaction.channel
      .awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        time: 60 * 1000,
      })
      .catch((err) => {
        if (err.message.includes("time")) return;
      });

    if (!res) return interaction.editReply({ content: "Timed out. Intentar otra vez", components: [] });
    await interaction.editReply({ content: "Procesando", components: [] });
    catName = res.values[0];
    catPerms = categories.find((cat) => cat.name === catName)?.staff_roles || [];
  }

  try {
    const ticketNumber = (existing + 1).toString();
    const permissionOverwrites = [
      {
        id: guild.roles.everyone,
        deny: ["ViewChannel"],
      },
      {
        id: user.id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
      },
      {
        id: guild.members.me.roles.highest.id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
      },
    ];

    if (catPerms?.length > 0) {
      catPerms?.forEach((roleId) => {
        const role = guild.roles.cache.get(roleId);
        if (!role) return;
        permissionOverwrites.push({
          id: role,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
        });
      });
    }

    const tktChannel = await guild.channels.create({
      name: `tіcket-${ticketNumber}`,
      type: ChannelType.GuildText,
      topic: `tіcket|${user.id}|${catName || "Default"}`,
      permissionOverwrites,
    });

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Ticket #${ticketNumber}` })
      .setDescription(
        `Hola ${user.toString()}
        El soporte estará contigo en breve
        ${catName ? `\n**Categoría:** ${catName}` : ""}
        `
      )
      .setFooter({ text: "Puede cerrar su ticket en cualquier momento haciendo clic en el botón a continuación" });

    let buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Cerrar ticket")
        .setCustomId("TICKET_CLOSE")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Primary)
    );

    const sent = await tktChannel.send({ content: user.toString(), embeds: [embed], components: [buttonsRow] });

    const dmEmbed = new EmbedBuilder()
      .setColor(TICKET.CREATE_EMBED)
      .setAuthor({ name: "Ticket creado" })
      .setThumbnail(guild.iconURL())
      .setDescription(
        `**Servidor:** ${guild.name}
        ${catName ? `**Categoría:** ${catName}` : ""}
        `
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Ver canal").setURL(sent.url).setStyle(ButtonStyle.Link)
    );

    user.send({ embeds: [dmEmbed], components: [row] }).catch((ex) => { });

    await interaction.editReply(`Ticket creado! 🔥`);
  } catch (ex) {
    error("handleTicketOpen", ex);
    return interaction.editReply("No se pudo crear el canal de ticket, se produjo un error!");
  }
}

/**
 * @param {import("discord.js").ButtonInteraction} interaction
 */
async function handleTicketClose(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const status = await closeTicket(interaction.channel, interaction.user);
  if (status === "MISSING_PERMISSIONS") {
    return interaction.followUp("No se puede cerrar el ticket porque faltan permisos. Póngase en contacto con el administrador del servidor para obtener ayuda!");
  } else if (status == "ERROR") {
    return interaction.followUp("No se pudo cerrar el ticket, ocurrió un error!");
  }
}

module.exports = {
  getTicketChannels,
  getExistingTicketChannel,
  isTicketChannel,
  closeTicket,
  closeAllTickets,
  handleTicketOpen,
  handleTicketClose,
};
