// Import Libraries
import CONFIG from "./config";
import { Client, Intents, Interaction } from "discord.js";
import { generateDependencyReport } from "@discordjs/voice";

// Import command handler
import CommandHandler from "./modules/commands/CommandHandler";

// Import commands
import StateManager from "./modules/state/StateManager";
import Play from "./commands/Play";
import Add from "./commands/QueueManipulation/Add";
import Queue from "./commands/QueueManipulation/Queue";
import Skip from "./commands/QueueManipulation/Skip";
import Pause from "./commands/QueueManipulation/Pause";
import NowPlaying from "./commands/NowPlaying";
import Disconnect from "./commands/Disconnect";

// Create Discord Client
const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
] });

console.log(generateDependencyReport() + "\n");

// Create Command Handler
const handler:CommandHandler = new CommandHandler();

// Register commands
handler.registerCommands(new Play());
handler.registerCommands(new Queue());
handler.registerCommands(new Add());
handler.registerCommands(new Skip());
handler.registerCommands(new Pause());
handler.registerCommands(new NowPlaying());
handler.registerCommands(new Disconnect());

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