const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getLeaderboard } = require('../models/StudyTime');
const { generateLeaderboardCard } = require('../utils/cardGenerator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top 10 study stars in the server'),
  
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const topUsers = await getLeaderboard(interaction.guild.id);
      
      if (!topUsers.length) {
        return await interaction.editReply('No study records found in this server yet.');
      }

      const cardBuffer = await generateLeaderboardCard(interaction.guild, topUsers, client);
      const attachment = new AttachmentBuilder(cardBuffer, { name: 'leaderboard.png' });
      
      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Leaderboard error:', error);
      await interaction.editReply('❌ Failed to generate leaderboard.');
    }
  }
};
