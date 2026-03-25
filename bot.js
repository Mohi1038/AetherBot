require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');
const db = require('./config/database');

const { updateTime, get } = require('./models/StudyTime');
if (typeof updateTime !== 'function' || typeof get !== 'function') {
  console.error('❌ StudyTime methods not properly exported');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
});

// Command handling
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if (!command.data) {
      console.error(`[WARNING] Command ${file} is missing required "data" property`);
      continue;
    }
    
    client.commands.set(command.data.name, command);
    console.log(`[INFO] Successfully loaded command: ${command.data.name}`);
  } catch (error) {
    console.error(`[ERROR] Failed to load command ${file}:`, error);
  }
}

// Event handling
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('✅ Bot is logging in...'))
  .catch(err => console.error('❌ Login failed:', err));

// Cleanup
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  const timeTracking = require('./utils/timeTracking');
  await timeTracking.saveAllActiveSessions();
  await db.end();
  process.exit(0);
});