const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { ECONOMY, EMBED_COLORS } = require("@root/config");

module.exports = async (remite, destinatario, coins) => {
  if (isNaN(coins) || coins <= 0) {
    return "Por favor, introduce una cantidad válida de monedas para transferir."
  }

  if (destinatario.bot) {
    return "No puedes transferir monedas a los bots!";
  }

  if (destinatario.id === remite.id) {
    return "No puedes transferir monedas a ti mismo!";
  }

  const userDb = await getUser(remite);

  if (userDb.bank < coins) {
    return `Saldo insuficiente en el banco! Solo tienes ${userDb.bank}${ECONOMY.CURRENCY} en tu cuenta bancaria. ${userDb.coins > 0 && "\nDebes depositar tus monedas en el banco antes de poder transferir."
      } `;
  }

  const targetDb = await getUser(destinatario);

  userDb.bank -= coins;
  targetDb.bank += coins;

  await userDb.save();
  await targetDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Saldo Actualizado" })
    .setDescription(`Has transferido con éxito ${coins}${ECONOMY.CURRENCY} a ${destinatario.username}`)
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};