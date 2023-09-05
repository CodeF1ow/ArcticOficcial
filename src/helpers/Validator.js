const CommandCategory = require("@structures/CommandCategory");
const permissions = require("./permissions");
const config = require("@root/config");
const { log, warn, error } = require("./Logger");
const { ApplicationCommandType } = require("discord.js");

module.exports = class Validator {
  static validateConfiguration() {
    log("Validando del archivo de configuracion y las variables de entorno");

    // Bot Token
    if (!process.env.BOT_TOKEN) {
      error("env: BOT_TOKEN no puede estar vacío");
      process.exit(1);
    }

    // Validate Database Config
    if (!process.env.MONGO_CONNECTION) {
      error("env: MONGO_CONNECTION no puede estar vacío");
      process.exit(1);
    }

    // Validate Dashboard Config
    if (config.DASHBOARD.enabled) {
      if (!process.env.BOT_SECRET) {
        error("env: BOT_SECRET no puede estar vacío");
        process.exit(1);
      }
      if (!process.env.SESSION_PASSWORD) {
        error("env: SESSION_PASSWORD no puede estar vacío");
        process.exit(1);
      }
      if (!config.DASHBOARD.baseURL || !config.DASHBOARD.failureURL || !config.DASHBOARD.port) {
        error("config.js: DASHBOARD los detalles no pueden estar vacíos");
        process.exit(1);
      }
    }

    // Cache Size
    if (isNaN(config.CACHE_SIZE.GUILDS) || isNaN(config.CACHE_SIZE.USERS) || isNaN(config.CACHE_SIZE.MEMBERS)) {
      error("config.js: CACHE_SIZE debe ser un entero positivo");
      process.exit(1);
    }

    // Music
    if (config.MUSIC.ENABLED) {
      if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        warn("env: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET están perdidos. Los enlaces de música de Spotify no funcionan");
      }
      if (config.MUSIC.LAVALINK_NODES.length == 0) {
        warn("config.js: Debe haber al menos un nodo para Lavalink");
      }
      if (!["YT", "YTM", "SC"].includes(config.MUSIC.DEFAULT_SOURCE)) {
        warn("config.js: MUSIC.DEFAULT_SOURCE must be either YT, YTM or SC");
      }
    }

    // Warnings
    if (config.OWNER_IDS.length === 0) warn("config.js: OWNER_IDS estan vacios");
    if (!config.SUPPORT_SERVER) warn("config.js: SUPPORT_SERVER no se proporciona");
    if (!process.env.WEATHERSTACK_KEY) warn("env: WEATHERSTACK_KEY Está perdido. El comando meteorológico no funciona");
    if (!process.env.STRANGE_API_KEY) warn("env: STRANGE_API_KEY Está perdido. Los comandos de imagen no funcionarán");
  }

  /**
   * @param {import('@structures/Command')} cmd
   */
  static validateCommand(cmd) {
    if (typeof cmd !== "object") {
      throw new TypeError("Los datos del comando deben ser un objeto..");
    }
    if (typeof cmd.name !== "string" || cmd.name !== cmd.name.toLowerCase()) {
      throw new Error("El nombre del comando debe ser una cadena en minúsculas..");
    }
    if (typeof cmd.description !== "string") {
      throw new TypeError("La descripción del comando debe ser una cadena.");
    }
    if (cmd.cooldown && typeof cmd.cooldown !== "number") {
      throw new TypeError("El tiempo de reutilización del comando debe ser un número");
    }
    if (cmd.category) {
      if (!Object.prototype.hasOwnProperty.call(CommandCategory, cmd.category)) {
        throw new Error(`Not a valid category ${cmd.category}`);
      }
    }
    if (cmd.userPermissions) {
      if (!Array.isArray(cmd.userPermissions)) {
        throw new TypeError("Comando userPermissions debe ser una matriz de cadenas de claves de permiso.");
      }
      for (const perm of cmd.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Permiso de usuario de comando no válido: ${perm}`);
      }
    }
    if (cmd.botPermissions) {
      if (!Array.isArray(cmd.botPermissions)) {
        throw new TypeError("Comando botPermissions debe ser una matriz de cadenas de claves de permiso.");
      }
      for (const perm of cmd.botPermissions) {
        if (!permissions[perm]) throw new RangeError(`Comando inválido botPermission: ${perm}`);
      }
    }
    if (cmd.validations) {
      if (!Array.isArray(cmd.validations)) {
        throw new TypeError("Las validaciones de comandos deben ser una matriz de objetos de validación..");
      }
      for (const validation of cmd.validations) {
        if (typeof validation !== "object") {
          throw new TypeError("Las validaciones de comandos deben ser un objeto..");
        }
        if (typeof validation.callback !== "function") {
          throw new TypeError("La devolución de llamada de validación de comando debe ser una función.");
        }
        if (typeof validation.message !== "string") {
          throw new TypeError("El mensaje de validación del comando debe ser una cadena..");
        }
      }
    }

    // Validate Command Details
    if (cmd.command) {
      if (typeof cmd.command !== "object") {
        throw new TypeError("Command.command debe ser un objeto");
      }
      if (Object.prototype.hasOwnProperty.call(cmd.command, "enabled") && typeof cmd.command.enabled !== "boolean") {
        throw new TypeError("Command.command habilitado debe ser un valor booleano");
      }
      if (
        cmd.command.aliases &&
        (!Array.isArray(cmd.command.aliases) ||
          cmd.command.aliases.some((ali) => typeof ali !== "string" || ali !== ali.toLowerCase()))
      ) {
        throw new TypeError("Command.command Los alias deben ser una matriz de cadenas en minúsculas..");
      }
      if (cmd.command.usage && typeof cmd.command.usage !== "string") {
        throw new TypeError("Command.command el uso debe ser una cadena");
      }
      if (cmd.command.minArgsCount && typeof cmd.command.minArgsCount !== "number") {
        throw new TypeError("Command.command minArgsCount must be a number");
      }
      if (cmd.command.subcommands && !Array.isArray(cmd.command.subcommands)) {
        throw new TypeError("Command.command los subcomandos deben ser una matriz");
      }
      if (cmd.command.subcommands) {
        for (const sub of cmd.command.subcommands) {
          if (typeof sub !== "object") {
            throw new TypeError("Command.command Los subcomandos deben ser una matriz de objetos.");
          }
          if (typeof sub.trigger !== "string") {
            throw new TypeError("Command.command El activador del subcomando debe ser una cadena.");
          }
          if (typeof sub.description !== "string") {
            throw new TypeError("Command.command la descripción del subcomando debe ser una cadena");
          }
        }
      }
      if (cmd.command.enabled && typeof cmd.messageRun !== "function") {
        throw new TypeError("Desaparecido 'messageRun' function");
      }
    }

    // Validate Slash Command Details
    if (cmd.slashCommand) {
      if (typeof cmd.slashCommand !== "object") {
        throw new TypeError("Command.slashCommand debe ser un objeto");
      }
      if (
        Object.prototype.hasOwnProperty.call(cmd.slashCommand, "enabled") &&
        typeof cmd.slashCommand.enabled !== "boolean"
      ) {
        throw new TypeError("Command.slashCommand habilitado debe ser un valor booleano");
      }
      if (
        Object.prototype.hasOwnProperty.call(cmd.slashCommand, "ephemeral") &&
        typeof cmd.slashCommand.ephemeral !== "boolean"
      ) {
        throw new TypeError("Command.slashCommand ephemeral debe ser un valor booleano");
      }
      if (cmd.slashCommand.options && !Array.isArray(cmd.slashCommand.options)) {
        throw new TypeError("Command.slashCommand las opciones deben ser una matriz");
      }
      if (cmd.slashCommand.enabled && typeof cmd.interactionRun !== "function") {
        throw new TypeError("Desaparecido 'interactionRun' function");
      }
    }
  }

  /**
   * @param {import('@structures/BaseContext')} context
   */
  static validateContext(context) {
    if (typeof context !== "object") {
      throw new TypeError("El contexto debe ser un objeto.");
    }
    if (typeof context.name !== "string" || context.name !== context.name.toLowerCase()) {
      throw new Error("El nombre del contexto debe ser una cadena en minúsculas..");
    }
    if (typeof context.description !== "string") {
      throw new TypeError("La descripción del contexto debe ser una cadena..");
    }
    if (context.type !== ApplicationCommandType.User && context.type !== ApplicationCommandType.Message) {
      throw new TypeError("El tipo de contexto debe ser cualquiera de los dos. User/Message.");
    }
    if (Object.prototype.hasOwnProperty.call(context, "enabled") && typeof context.enabled !== "boolean") {
      throw new TypeError("El contexto habilitado debe ser un valor booleano");
    }
    if (Object.prototype.hasOwnProperty.call(context, "ephemeral") && typeof context.ephemeral !== "boolean") {
      throw new TypeError("El contexto habilitado debe ser un valor booleano");
    }
    if (
      Object.prototype.hasOwnProperty.call(context, "defaultPermission") &&
      typeof context.defaultPermission !== "boolean"
    ) {
      throw new TypeError("Context defaultPermission must be a boolean value");
    }
    if (Object.prototype.hasOwnProperty.call(context, "cooldown") && typeof context.cooldown !== "number") {
      throw new TypeError("Context cooldown must be a number");
    }
    if (context.userPermissions) {
      if (!Array.isArray(context.userPermissions)) {
        throw new TypeError("Context userPermissions must be an Array of permission key strings.");
      }
      for (const perm of context.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }
  }
};
