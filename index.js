const Discord = require("discord.js"),
    config = require("./config.json"),
    client = new Discord.Client({
        intents: [
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Intents.FLAGS.DIRECT_MESSAGES,
            Discord.Intents.FLAGS.GUILD_VOICE_STATES,
            Discord.Intents.FLAGS.GUILD_MEMBERS,
        ],
        partials: ["CHANNEL"],
    }),
    { createSlashCommand, submitSlashCommands } = require("./utils/commands"),
    Music = require("./managers/music.js"),
    music = new Music(),
    log = require("./utils/log.js");

client.on("ready", () => {
    const guilds = client.guilds.cache;

    log(`[READY] ${client.user.username} was started`);
    log(`[READY] ${guilds.size} guilds were found`);

    createGlobalCommands();

    guilds.forEach((guild) => {
        log(`[READY] Creating basic commands for ${guild.name}`);
        createBasicCommands(guild.id);
    });
});

client.on("guildCreate", (guild) => {
    log("[GUILD_CREATE] Creating basic commands for " + guild.name);
    createBasicCommands(guild.id);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case "ping": {
            await interaction.reply("Pong!");

            break;
        }

        case "server": {
            const embed = new Discord.MessageEmbed()
                .setColor("#A1D3F2")
                .setThumbnail(interaction.guild.iconURL())
                .addField(
                    "Name",
                    `${interaction.guild.name} (${interaction.guild.id})`,
                    false
                )
                .addField(
                    "Creation Date",
                    `<t:${Math.round(
                        interaction.guild.createdTimestamp / 1000
                    )}:F>`,
                    false
                )
                .addField(
                    "Roles",
                    interaction.guild.roles.cache
                        .map((r) => `\`${r.name}\``)
                        .join(", ") || "Not available",
                    false
                );

            await interaction.reply({ embeds: [embed] });

            break;
        }

        case "user": {
            const user = interaction.options.getUser("user");

            if (user) {
                const member = interaction.guild.members.cache.find(
                        (member) => member.id === user.id
                    ),
                    embed = new Discord.MessageEmbed()
                        .setColor("#A1D3F2")
                        .setThumbnail(user.avatarURL())
                        .addField("Name", `${user.tag} (${user.id})`, false)
                        .addField(
                            "Join Date",
                            `<t:${Math.round(
                                member.joinedTimestamp / 1000
                            )}:F>`,
                            false
                        )
                        .addField(
                            "Creation Date",
                            `<t:${Math.round(user.createdTimestamp / 1000)}:F>`,
                            false
                        )
                        .addField(
                            "Roles",
                            member.roles.cache
                                .map((r) => `\`${r.name}\``)
                                .join(", ") || "Not available",
                            false
                        );

                await interaction.reply({ embeds: [embed] });

                break;
            } else {
                const member = interaction.guild.members.cache.find(
                        (member) => member.id === interaction.user.id
                    ),
                    embed = new Discord.MessageEmbed()
                        .setColor("#A1D3F2")
                        .setThumbnail(interaction.user.avatarURL())
                        .addField(
                            "Name",
                            `${interaction.user.tag} (${interaction.user.id})`,
                            false
                        )
                        .addField(
                            "Join Date",
                            `<t:${Math.round(
                                member.joinedTimestamp / 1000
                            )}:F>`,
                            false
                        )
                        .addField(
                            "Creation Date",
                            `<t:${Math.round(
                                interaction.user.createdTimestamp / 1000
                            )}:F>`,
                            false
                        )
                        .addField(
                            "Roles",
                            member.roles.cache
                                .map((r) => `\`${r.name}\``)
                                .join(", ") || "Not available",
                            false
                        );

                await interaction.reply({ embeds: [embed] });

                break;
            }
        }

        case "play": {
            music.setup(interaction);

            break;
        }

        case "skip": {
            music.skip(interaction);

            break;
        }

        case "stop": {
            music.stop(interaction);

            break;
        }

        case "queue": {
            music.listQueue(interaction);

            break;
        }
    }
});

/**
 * Creates basic commands for the guild
 * @param {string} guildId
 */
function createBasicCommands(guildId) {
    const commands = [].map((command) => command.toJSON());

    submitSlashCommands(commands, guildId);
}

function createGlobalCommands() {
    const commands = [
        createSlashCommand("ping", "Replies with pong!", {}),
        createSlashCommand("server", "Replies with server info!", {}),
        createSlashCommand("user", "Replies with user info!", {
            options: [
                {
                    type: "userOption",
                    name: "user",
                    description: "Mention an user",
                },
            ],
        }),
        createSlashCommand("play", "Play music from YouTube", {
            options: [
                {
                    type: "stringOption",
                    name: "search",
                    description: "YouTube search query or url",
                    required: true,
                },
            ],
        }),
        createSlashCommand("skip", "Skips the current song", {}),
        createSlashCommand("stop", "Stops the music", {}),
        createSlashCommand("queue", "Lists all items in the music queue", {}),
    ].map((command) => command.toJSON());

    submitSlashCommands(commands);
}

client.login(config.discord.token);
