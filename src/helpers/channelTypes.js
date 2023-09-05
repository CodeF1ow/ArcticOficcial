const { ChannelType } = require("discord.js");

/**
 * @param {number} type
 */
module.exports = (type) => {
  switch (type) {
    case ChannelType.GuildText:
      return "Texto del servidor";
    case ChannelType.GuildVoice:
      return "Voz del servidor";
    case ChannelType.GuildCategory:
      return "Categoría de servidor";
    case ChannelType.GuildAnnouncement:
      return "Anuncio del servidor";
    case ChannelType.AnnouncementThread:
      return "Hilo de anuncios del servidor";
    case ChannelType.PublicThread:
      return "Hilo público del servidor";
    case ChannelType.PrivateThread:
      return "Hilo privado del servidor";
    case ChannelType.GuildStageVoice:
      return "Voz del escenario del servidor";
    case ChannelType.GuildDirectory:
      return "Directorio de servidor";
    case ChannelType.GuildForum:
      return "Foro del servidor";
    default:
      return "Unknown";
  }
};
