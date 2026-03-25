const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { get } = require('../models/StudyTime');
const { generateStatsCard } = require('../utils/cardGenerator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View your study time statistics')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('View another user\'s stats')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    try {
      await interaction.deferReply();
      const stats = await get(targetUser.id, interaction.guild.id);
      const imageBuffer = await generateStatsCard(targetUser, stats);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'stats-card.png' });
      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Stats command failed:', error);
      await interaction.reply({
        content: '❌ Failed to fetch study statistics',
        flags: 64 // 64 = ephemeral flag
      });
    }
  }
};