const user = require("../shared/user");
const channelInfo = require("../shared/channel");
const guildInfo = require("../shared/guild");
const avatar = require("../shared/avatar");
const emojiInfo = require("../shared/emoji");
const botInfo = require("../shared/botstats");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "info",
  description: "Muestra información diversa",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "Obtiene información de un usuario",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "El nombre del usuario",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "channel",
        description: "Obtiene información de un canal",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "El nombre del canal",
            type: ApplicationCommandOptionType.Channel,
            required: false,
          },
        ],
      },
      {
        name: "guild",
        description: "Obtiene información del servidor",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "bot",
        description: "Obtiene información del bot",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "avatar",
        description: "Muestra información de un avatar",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "El nombre del usuario",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "emoji",
        description: "Muestra información de un emoticón",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "El nombre del emoticón",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Subcomando inválido");
    let response;

    // user
    if (sub === "user") {
      let targetUser = interaction.options.getUser("name") || interaction.user;
      let target = await interaction.guild.members.fetch(targetUser);
      response = user(target);
    }

    // channel
    else if (sub === "channel") {
      let targetChannel = interaction.options.getChannel("name") || interaction.channel;
      response = channelInfo(targetChannel);
    }

    // guild
    else if (sub === "guild") {
      response = await guildInfo(interaction.guild);
    }

    // bot
    else if (sub === "bot") {
      response = botInfo(interaction.client);
    }

    // avatar
    else if (sub === "avatar") {
      let target = interaction.options.getUser("name") || interaction.user;
      response = avatar(target);
    }

    // emoji
    else if (sub === "emoji") {
      let emoji = interaction.options.getString("name");
      response = emojiInfo(emoji);
    }

    // return
    else {
      response = "Subcomando incorrecto";
    }

    await interaction.followUp(response);
  },
};