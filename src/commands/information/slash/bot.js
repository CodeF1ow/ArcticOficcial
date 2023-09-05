const {
  EmbedBuilder,           // Constructor para crear objetos Embed (Incrustados)
  ButtonBuilder,          // Constructor para crear botones
  ActionRowBuilder,       // Constructor para crear filas de acciones
  ApplicationCommandOptionType, // Tipos de opciones de comandos de aplicación
  ButtonStyle,             // Estilo de los botones
} = require("discord.js");
const { timeformat } = require("@helpers/Utils");  // Función para formatear el tiempo
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config.js");  // Importación de colores de incrustados, URL de servidor de soporte y configuración del panel de control
const botstats = require("../shared/botstats");  // Importación de estadísticas del bot

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bot",
  description: "Comandos relacionados con el bot",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],  // Permisos requeridos para el bot (en este caso, para enviar enlaces embebidos)
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "invite",
        description: "Obtener la invitación del bot",
        type: ApplicationCommandOptionType.Subcommand,  // Subcomando
      },
      {
        name: "stats",
        description: "Obtener las estadísticas del bot",
        type: ApplicationCommandOptionType.Subcommand,  // Subcomando
      },
      {
        name: "uptime",
        description: "Obtener el tiempo de actividad del bot",
        type: ApplicationCommandOptionType.Subcommand,  // Subcomando
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();  // Obtener el subcomando seleccionado
    if (!sub) return interaction.followUp("No es un subcomando válido");  // Si no se proporciona un subcomando válido, mostrar un mensaje

    // Invitación
    if (sub === "invite") {
      const response = botInvite(interaction.client);  // Obtener la respuesta de la función botInvite
      try {
        await interaction.user.send(response);  // Enviar la respuesta al usuario que solicitó la información
        return interaction.followUp("Revisa tus mensajes directos para obtener mi información! :envelope_with_arrow:");
      } catch (ex) {
        return interaction.followUp("No puedo enviarte mi información! Tienes los mensajes directos abiertos?");
      }
    }

    // Estadísticas
    else if (sub === "stats") {
      const response = botstats(interaction.client);  // Obtener las estadísticas del bot
      return interaction.followUp(response);  // Responder con las estadísticas
    }

    // Tiempo de actividad
    else if (sub === "uptime") {
      await interaction.followUp(`Mi tiempo de actividad: \`${timeformat(process.uptime())}\``);  // Mostrar el tiempo de actividad del bot
    }
  },
};

function botInvite(client) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Invite" })  // Configuración del autor en el incrustado
    .setColor(EMBED_COLORS.BOT_EMBED)   // Establecer el color del incrustado
    .setThumbnail(client.user.displayAvatarURL())  // Establecer la miniatura del bot en el incrustado
    .setDescription("Hola! Gracias por considerar invitarme.\nUtiliza el botón de abajo para navegar a donde quieras.");  // Descripción del incrustado

  // Botones
  let components = [];
  components.push(new ButtonBuilder().setLabel("Enlace de Invitación").setURL(client.getInvite()).setStyle(ButtonStyle.Link));  // Crear un botón para la invitación del bot

  if (SUPPORT_SERVER) {
    components.push(new ButtonBuilder().setLabel("Servidor de Soporte").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));  // Crear un botón para el servidor de soporte si está definido
  }

  if (DASHBOARD.enabled) {
    components.push(
      new ButtonBuilder().setLabel("Enlace al Panel de Control").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
    );  // Crear un botón para el panel de control si está habilitado
  }

  let buttonsRow = new ActionRowBuilder().addComponents(components);  // Crear una fila de acciones con los botones
  return { embeds: [embed], components: [buttonsRow] };  // Devolver el incrustado y la fila de acciones
}
