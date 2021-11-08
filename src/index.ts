// Import Libraries
import CONFIG from "./config";
import { Client, Guild, Intents, Interaction } from "discord.js";
import { generateDependencyReport } from "@discordjs/voice";

// Import command handler
import CommandHandler from "./modules/commands/CommandHandler";

// Import commands
import StateManager from "./modules/state/StateManager";
import Play from "./commands/QueueManipulation/Play";
import Queue from "./commands/QueueManipulation/Queue";
import Skip from "./commands/QueueManipulation/Skip";
import Pause from "./commands/Pause";
import NowPlaying from "./commands/NowPlaying";
import Disconnect from "./commands/Disconnect";
import Clear from "./commands/QueueManipulation/Clear";
import Remove from "./commands/QueueManipulation/Remove";
import Help from "./commands/Help";
import Unpause from "./commands/Unpause";
import DiscordServer from "./modules/state/DiscordServer";
import Loop from "./commands/QueueManipulation/Loop";

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
handler.registerCommands(new Skip());
handler.registerCommands(new Pause());
handler.registerCommands(new Unpause());
handler.registerCommands(new NowPlaying());
handler.registerCommands(new Disconnect());
handler.registerCommands(new Clear());
handler.registerCommands(new Remove());
handler.registerCommands(new Help());
handler.registerCommands(new Loop());

// Create State Handler
const applicationState = new StateManager();

// Handle Client Events
client.once('ready', async () => { // Run when the client logs in sucessfully
    console.log("[Status] Ready");

    // Create States
    await applicationState.addServers(client);

    // Register Commands
    handler.registerSlashCommands(client);

    client.user?.setActivity("music");
});

// Create Interaction
client.on('interactionCreate', (interaction: Interaction) => {
    if(!interaction.isCommand()) return;

    handler.handle(interaction);
});

// On Server Join
client.on("guildCreate", (guild: Guild) => {
    // Re-Register Slash Commands
    console.log("[Status] Joined new server");
    handler.registerSlashCommands(client); // Re Register Slash Commands
    applicationState.addServer(new DiscordServer(guild.id, guild.name)); // Create server state
});

// Login with our client token
client.login(CONFIG.TOKEN);

// On Close
async function closeGracefully(signal: any) {
    console.log("[Node] Closing Server");

    // TODO - Leave Server VC's

    // Disconnect Client
    client.destroy();
    console.log("[Status] Disconnected");
    
    process.exit();
}
process.on("SIGINT", closeGracefully);

export { applicationState };