const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config");

module.exports = async (usuario, coins) => {
  if (isNaN(coins) || coins <= 0) {
    return "Por favor, introduce una cantidad válida de monedas para depositar.";
  }

  const userDb = await getUser(usuario);

  if (coins > userDb.bank) {
    return `Solo tienes ${userDb.bank}${ECONOMY.CURRENCY} monedas en tu cuenta bancaria.`;
  }

  userDb.bank -= coins;
  userDb.coins += coins;

  await userDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Nuevo Saldo" })
    .setThumbnail(usuario.displayAvatarURL())
    .addFields(
      {
        name: "Billetera",
        value: `${userDb.coins}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Banco",
        value: `${userDb.bank}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Patrimonio Neto",
        value: `${userDb.coins + userDb.bank}${ECONOMY.CURRENCY}`,
        inline: true,
      }
    );

  return { embeds: [embed] };
};