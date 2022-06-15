const { Client, Intents } = require("discord.js");

/**
 * @class ReactionRoleClient
 * @extends {Client}
 */
class ReactionRoleClient extends Client {
    /**
     * Creates an instance of ReactionRoleClient.
     * @param {import("discord.js").ClientOptions} [options]
     * @memberof ReactionRoleClient
     */
    constructor() {
        super({intents : [
        	Intents.FLAGS.GUILDS, 
            Intents.FLAGS.GUILD_MEMBERS, 
            Intents.FLAGS.GUILD_BANS, 
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, 
            Intents.FLAGS.GUILD_INTEGRATIONS, 
            Intents.FLAGS.GUILD_WEBHOOKS, 
            Intents.FLAGS.GUILD_INVITES, 
            Intents.FLAGS.GUILD_VOICE_STATES, 
            Intents.FLAGS.GUILD_PRESENCES, 
            Intents.FLAGS.GUILD_MESSAGES, 
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
            Intents.FLAGS.GUILD_MESSAGE_TYPING, 
            Intents.FLAGS.DIRECT_MESSAGES, 
            Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
            Intents.FLAGS.DIRECT_MESSAGE_TYPING
        ]});
        this.config = require("./config.json");
        this.data = require("./data.json");

        this.on("ready", async (client) => {
            console.log(`[INFO] Logged in as ${this.user.tag}.`);
            // eslint-disable-next-line no-restricted-syntax
            for (const data of Object.values(this.data)) {
                try {
                    await client.channels.fetch(data.channelID).then(async channel => {
                        await channel.messages.fetch(data.messageID).then(async message => {
                            console.log("Fetched " + message.id + " successfully !");
                        });
                    });
                } catch (e) {
                    console.log(`[ERR] Error when fetching ${data.messageID}, because ${e.message}.`);
                }
            }
        });
        this.on("messageReactionAdd", async (messageReaction, user) => {
            await this.handleRole(messageReaction, user, "add");
        });
        this.on("messageReactionRemove", async (messageReaction, user) => {
            await this.handleRole(messageReaction, user, "remove");
        });

        this.login(this.config.token);
    }

    /**
     * @param {import("discord.js").MessageReaction} messageReaction
     * @param {import("discord.js").User} user
     * @param {String} type
     * @returns {Promise<void>}
     * @memberof ReactionRoleClient
     */
    async handleRole(messageReaction, user, type) {
        if (!type || !["add", "remove"].includes(type.toLowerCase())) {
            return undefined;
        } 
        if (messageReaction.me){
            return undefined;
        }

        const { message } = messageReaction;
        const data = this.data[message.id];

        if (data) {
            const emoji = data.emojis[messageReaction._emoji.name];

            if (!emoji) return undefined;

            await this.guilds.fetch(message.guildId).then(async guild => {
                await guild.members.fetch(user.id).then(async member => {
                    if (type.toLowerCase() === "add") await member.roles.add(emoji);
                    if (type.toLowerCase() === "remove") await member.roles.remove(emoji);
                })
            });
            
        }
        return undefined;
    }
}

module.exports = new ReactionRoleClient();