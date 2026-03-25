const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const User = require('../models/User');
const StudyTime = require('../models/StudyTime');
const Levels = require('../models/Levels');
const Economy = require('../models/Economy');
const { generateProfileCard } = require('../utils/cardGenerator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View or edit your profile')
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View your profile')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('The user to view (leave empty for yourself)')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit')
        .setDescription('Edit your profile')
        .addStringOption(option =>
          option.setName('about')
            .setDescription('Your about me section')
            .setRequired(true)
        )
    ),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'view') {
      const user = interaction.options.getUser('user') || interaction.user;
      const member = interaction.guild.members.cache.get(user.id);
      const [userData, studyData, levelData, economyData] = await Promise.all([
        User.get(user.id, interaction.guild.id),
        StudyTime.get(user.id, interaction.guild.id),
        Levels.get(user.id, interaction.guild.id),
        Economy.getBalance(user.id, interaction.guild.id)
      ]);
      const imageBuffer = await generateProfileCard(user, member, userData, studyData, levelData, economyData);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'profile-card.png' });
      await interaction.reply({ files: [attachment] });
    } else if (subcommand === 'edit') {
      const about = interaction.options.getString('about');
      await User.update(interaction.user.id, interaction.guild.id, { about });
      await interaction.reply({
        content: '✅ Your profile has been updated!',
        flags: 64 // 64 = ephemeral flag
      });
    }
  }
};