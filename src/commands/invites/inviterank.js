const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "inviterank",
  description: "configurar rangos de invitación",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<role-name> <invites>",
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "add <role> <invites>",
        description: "agregar clasificación automática después de alcanzar un número particular de invitaciones",
      },
      {
        trigger: "eliminar rol",
        description: "eliminar el rango de invitación configurado con ese rol",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "add",
        description: "agregar un nuevo rango de invitación",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "rol que se le dara",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
          {
            name: "invites",
            description: "Número de invitaciones necesarias para obtener el puesto.",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "eliminar un rango de invitación previamente configurado",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "rol con rango de invitación configurado",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0].toLowerCase();

    if (sub === "add") {
      const query = args[1];
      const invites = args[2];

      if (isNaN(invites)) return message.safeReply(`\`${invites}\` No es un número válido de invitaciones?`);
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(`No se encontraron roles que coincidan \`${query}\``);

      const response = await addInviteRank(message, role, invites, data.settings);
      await message.safeReply(response);
    }

    //
    else if (sub === "remove") {
      const query = args[1];
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(`No se encontraron roles que coincidan \`${query}\``);
      const response = await removeInviteRank(message, role, data.settings);
      await message.safeReply(response);
    }

    //
    else {
      await message.safeReply("Uso incorrecto del comando!");
    }
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    //
    if (sub === "add") {
      const role = interaction.options.getRole("role");
      const invites = interaction.options.getInteger("invites");

      const response = await addInviteRank(interaction, role, invites, data.settings);
      await interaction.followUp(response);
    }

    //
    else if (sub === "remove") {
      const role = interaction.options.getRole("role");
      const response = await removeInviteRank(interaction, role, data.settings);
      await interaction.followUp(response);
    }
  },
};

async function addInviteRank({ guild }, role, invites, settings) {
  if (!settings.invite.tracking) return `El seguimiento de invitaciones está deshabilitado en este servidor`;

  if (role.managed) {
    return "No puedes asignar un rol de bot";
  }

  if (guild.roles.everyone.id === role.id) {
    return "No puedo asignar el rol de everyone.";
  }

  if (!role.editable) {
    return "Me faltan permisos para mover miembros a ese rol. Ese rol está por debajo de mi rol más alto?";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);

  let msg = "";
  if (exists) {
    exists.invites = invites;
    msg += "Se encontró una configuración anterior para este rol. Sobrescribir datos\n";
  }

  settings.invite.ranks.push({ _id: role.id, invites });
  await settings.save();
  return `${msg}Éxito! Configuración guardada.`;
}

async function removeInviteRank({ guild }, role, settings) {
  if (!settings.invite.tracking) return `El seguimiento de invitaciones está deshabilitado en este servidor`;

  if (role.managed) {
    return "No puedes asignar un rol de bot";
  }

  if (guild.roles.everyone.id === role.id) {
    return "No puedes asignar el rol de everyone.";
  }

  if (!role.editable) {
    return "Me faltan permisos para mover miembros de ese rol. Ese rol está por debajo de mi rol más alto?";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);
  if (!exists) return "No se encontró ningún rango de invitación anterior configurado para este rol";

  // delete element from array
  const i = settings.invite.ranks.findIndex((obj) => obj._id === role.id);
  if (i > -1) settings.invite.ranks.splice(i, 1);

  await settings.save();
  return "Éxito! Configuración guardada.";
}
