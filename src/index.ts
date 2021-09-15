// Import Libraries
import CONFIG from "./config";
import { Client, Intents } from "discord.js";

// Import command handler
import CommandHandler from "./modules/CommandHandler";

// Import commands
import { HelloWorld } from "./modules/Command";

// Create Client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
 
// Create Command Handler
const handler:CommandHandler = new CommandHandler();

// Register commands
handler.registerCommands(new HelloWorld());

// Handle Client Events
client.once('ready', () => { // Run when the client logs in sucessfully
    console.log("[Status] Ready");

    // Register Commands
    handler.registerSlashCommands(client);
});

// Login with our client token
client.login(CONFIG.TOKEN);

