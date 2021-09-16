// Import Libraries
import CONFIG from "./config";
import { Client, CommandInteraction, Intents, Interaction } from "discord.js";

// Import command handler
import CommandHandler from "./modules/CommandHandler";

// Import commands
import StateManager from "./modules/state/StateManager";
import DiscordServer from "./modules/state/DiscordServer";
import { GetName, SetName } from "./commands/GetName";

// Create Discord Client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
 
// Create Command Handler
const handler:CommandHandler = new CommandHandler();

// Register commands
handler.registerCommands(new GetName());
handler.registerCommands(new SetName());

// Create State Handler
const applicationState = new StateManager();

// Handle Client Events
client.once('ready', async () => { // Run when the client logs in sucessfully
    console.log("[Status] Ready");

    // Create States
    await applicationState.addServers(client);

    // Register Commands
    handler.registerSlashCommands(client);
});

client.on('interactionCreate', (interaction: Interaction) => {
    if(!interaction.isCommand()) return;

    handler.handle(interaction);
})

// Login with our client token
client.login(CONFIG.TOKEN);

export { applicationState };