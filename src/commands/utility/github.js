const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "github",
  description: "muestra estadísticas de github de un usuario",
  cooldown: 10,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["git"],
    usage: "<username>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "username",
        description: "nombre de usuario de github",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const username = args.join(" ");
    const response = await getGithubUser(username, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const username = interaction.options.getString("username");
    const response = await getGithubUser(username, interaction.user);
    await interaction.followUp(response);
  },
};

const websiteProvided = (text) => (text.startsWith("http://") ? true : text.startsWith("https://"));

async function getGithubUser(target, author) {
  const response = await getJson(`https://api.github.com/users/${target}`);
  if (response.status === 404) return "```No se encontró ningún usuario con ese nombre.```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  const {
    login: username,
    name,
    id: githubId,
    avatar_url: avatarUrl,
    html_url: userPageLink,
    followers,
    following,
    bio,
    location,
    blog,
  } = json;

  let website = websiteProvided(blog) ? `[Haz click](${blog})` : "No provisto";
  if (website == null) website = "No provisto";

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Usuario de GitHub: ${username}`,
      url: userPageLink,
      iconURL: avatarUrl,
    })
    .addFields(
      {
        name: "Información de usuario",
        value: stripIndent`
        **Nombre real**: *${name || "No provisto"}*
        **Ubicación**: *${location}*
        **GitHub ID**: *${githubId}*
        **Sitio web**: *${website}*\n`,
        inline: true,
      },
      {
        name: "Estadísticas sociales",
        value: `**Seguidores**: *${followers}*\n**Siguiente**: *${following}*`,
        inline: true,
      }
    )
    .setDescription(`**Bio**:\n${bio || "No provisto"}`)
    .setImage(avatarUrl)
    .setColor(0x6e5494)
    .setFooter({ text: `Solicitado por ${author.username}` });

  return { embeds: [embed] };
}
