const { ApplicationCommandOptionType } = require("discord.js");
const balance = require("./sub/balance");
const deposit = require("./sub/deposit");
const transfer = require("./sub/transfer");
const withdraw = require("./sub/withdraw");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bank",
  description: "acceso a operaciones bancarias",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "balance",
        description: "consulta tu saldo",
      },
      {
        trigger: "deposit <coins>",
        description: "deposita monedas en tu cuenta bancaria",
      },
      {
        trigger: "withdraw <coins>",
        description: "retira monedas de tu cuenta bancaria",
      },
      {
        trigger: "transfer <user> <coins>",
        description: "transfiere monedas a otro usuario",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "balance",
        description: "consulta tu saldo en monedas",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "nombre del usuario",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "deposit",
        description: "deposita monedas en tu cuenta bancaria",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "coins",
            description: "cantidad de monedas que deseas depositar",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "withdraw",
        description: "retira monedas de tu cuenta bancaria",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "coins",
            description: "cantidad de monedas que deseas retirar",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "transfer",
        description: "transfiere monedas a otro usuario",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "el usuario a quien se deben transferir las monedas",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "coins",
            description: "la cantidad de monedas que se van a transferir",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0];
    let response;

    if (sub === "balance") {
      const resolved = (await message.guild.resolveMember(args[1])) || message.member;
      response = await balance(resolved.user);
    }

    else if (sub === "deposit") {
      const coins = args.length && parseInt(args[1]);
      if (isNaN(coins)) return message.safeReply("Introduce una cantidad válida de monedas a depositar");
      response = await deposit(message.author, coins);
    }

    else if (sub === "withdraw") {
      const coins = args.length && parseInt(args[1]);
      if (isNaN(coins)) return message.safeReply("Introduce una cantidad válida de monedas a retirar");
      response = await withdraw(message.author, coins);
    }

    else if (sub === "transfer") {
      if (args.length < 3) return message.safeReply("Proporciona un usuario válido y una cantidad de monedas a transferir");
      const target = await message.guild.resolveMember(args[1], true);
      if (!target) return message.safeReply("Proporciona un usuario válido donde transferir las monedas");
      const coins = parseInt(args[2]);
      if (isNaN(coins)) return message.safeReply("Introduce una cantidad válida de monedas que deseas transferir");
      response = await transfer(message.author, target.user, coins);
    }

    else {
      return message.safeReply("Comando no válido");
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    if (sub === "balance") {
      const user = interaction.options.getUser("user") || interaction.user;
      response = await balance(user);
    }

    else if (sub === "deposit") {
      const coins = interaction.options.getInteger("coins");
      response = await deposit(interaction.user, coins);
    }

    else if (sub === "withdraw") {
      const coins = interaction.options.getInteger("coins");
      response = await withdraw(interaction.user, coins);
    }

    else if (sub === "transfer") {
      const user = interaction.options.getUser("user");
      const coins = interaction.options.getInteger("coins");
      response = await transfer(interaction.user, user, coins);
    }

    await interaction.followUp(response);
  },
};