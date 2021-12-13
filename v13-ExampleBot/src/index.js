const discord = require("discord.js");
const fs = require('fs')
const client = new discord.Client({
    intents: [discord.Intents.FLAGS.GUILDS], //32767,
    allowedMentions: {
        // parse: ['users', 'roles'],
        repliedUser: false
    }
});
client.commands = new discord.Collection();
const {
    token,
    mongourl,
    guildID // THIS is guildID of server which will have all slahs commands.
} = require("./config.json");
const CurrencySystem = require("currency-system");
const cs = new CurrencySystem;
// Debug logs! Help in finding issues!
CurrencySystem.cs.on('debug', (debug, error) => {
    console.log(debug);
    if (error) console.error(error);
});
// Login To Discord Bot Client!
client.login(token);
// Set MongoDB URL!
cs.setMongoURL(mongourl);
// Set Default Bank Amount when a new user is created!
cs.setDefaultBankAmount(1000);
//  Its bank space limit (can be changed according to per user) here 0 means infinite.
cs.setMaxBankAmount(10000);
// Set Default Maximum Amount of Wallet Currency a user can have! (can be changed according to per user) here 0 means infinite.
cs.setMaxWalletAmount(10000);
// Search for new npm package updates on bot startup! Latest version will be displayed in console.
cs.searchForNewUpdate(true)
// Set Default Maximum Amount of Bank Currency a user can have! (can be changed according to per user) here 0 means infinite.
cs.setDefaultBankLimitForUser(1000)


process.on("unhandledRejection", _ => console.error(_.stack + '\n' + '='.repeat(20)));

for (const file of require('fs').readdirSync('./src/commands').filter(file => file.endsWith('.js'))) {
    const command = require(`./commands/${file}`);
    if (command.help.data) client.commands.set(command.help.data.name, command);
};
console.log(Array.from(client.commands).map(a => a[1].help.name))
client.on('ready', () => client.guilds.cache.get(guildID).commands.set(Array.from(client.commands.values()).map(a => a.help.data)))
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.run(client, interaction, interaction.options._hoistedOptions);
    } catch (error) {
        console.error(error);
        return interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true
        });
    }
});

Object.defineProperty(Array.prototype, "get", {
    value: function (arg) {
        const d = this.find(a => a.name === arg);
        if (d && d.value) return d.value;
        else return null;
    }
});