const { canModerate } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "nick",
  description: "comandos de apodo",
  category: "MODERATION",
  botPermissions: ["ManageNicknames"],
  userPermissions: ["ManageNicknames"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "set <@member> <name>",
        description: "establece el apodo del miembro especificado",
      },
      {
        trigger: "reset <@member>",
        description: "restablecer el apodo de un miembro",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "set",
        description: "cambiar el apodo de un miembro",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "el miembro cuyo nick quieres establecer",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "name",
            description: "el apodo para establecer",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reset",
        description: "restablecer el apodo de un miembro",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "los miembros cuyo nick quieres restablecer",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "set") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("No se pudo encontrar un miembro coincidente");
      const name = args.slice(2).join(" ");
      if (!name) return message.safeReply("Por favor especifica un apodo");

      const response = await nickname(message, target, name);
      return message.safeReply(response);
    }

    //
    else if (sub === "reset") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("No se pudo encontrar un miembro coincidente");

      const response = await nickname(message, target);
      return message.safeReply(response);
    }
  },

  async interactionRun(interaction) {
    const name = interaction.options.getString("name");
    const target = await interaction.guild.members.fetch(interaction.options.getUser("user"));

    const response = await nickname(interaction, target, name);
    await interaction.followUp(response);
  },
};

async function nickname({ member, guild }, target, name) {
  if (!canModerate(member, target)) {
    return `¡Ups! No puedes administrar el apodo de ${target.user.username}`;
  }
  if (!canModerate(guild.members.me, target)) {
    return `¡Ups! No puedo administrar el apodo de ${target.user.username}`;
  }

  try {
    await target.setNickname(name);
    return `${nombre ? "cambiado" : "reset"} apodo de ${target.user.username}`;
  } catch (ex) {
    return `Fallado ${name ? "change" : "reset"} apodo para ${target.displayName}. ¿Proporcionó un nombre válido?`;
  }
}
