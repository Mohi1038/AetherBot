const { SlashCommandBuilder } = require('discord.js');
const Economy = require('../models/Economy');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Economy commands')
    .addSubcommand(sub => 
      sub.setName('balance')
         .setDescription('Check your coin balance'))
    .addSubcommand(sub =>
      sub.setName('daily')
         .setDescription('Claim your daily coins'))
    .addSubcommand(sub =>
      sub.setName('coinflip')
         .setDescription('Flip a coin to gamble')
         .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to bet').setRequired(true))),
  
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    if (sub === 'balance') {
      const balance = await Economy.getBalance(userId, guildId);
      await interaction.reply(`💰 Your balance is **${balance} coins**.`);
    }

    if (sub === 'daily') {
      const amount = 100;
      const result = await Economy.claimDaily(userId, guildId, amount);
      if (result.success) {
        await interaction.reply(`🎁 You claimed your daily **${amount} coins**!`);
      } else {
        await interaction.reply({ 
          content: `❌ You already claimed your daily coins! Try again in **${ms(result.remaining, { long: true })}**.`,
          flags: 64
        });
      }
    }

    if (sub === 'coinflip') {
      const amount = interaction.options.getInteger('amount');
      const balance = await Economy.getBalance(userId, guildId);
      
      if (amount <= 0) return interaction.reply({ content: '❌ Amount must be greater than 0.', flags: 64 });
      if (balance < amount) return interaction.reply({ content: '❌ You don\'t have enough coins.', flags: 64 });

      const win = Math.random() > 0.5;
      if (win) {
        await Economy.addCoins(userId, guildId, amount);
        await interaction.reply(`🪙 The coin landed on **Heads**! You won **${amount} coins**!`);
      } else {
        await Economy.addCoins(userId, guildId, -amount);
        await interaction.reply(`🪙 The coin landed on **Tails**... You lost **${amount} coins**.`);
      }
    }
  }
};
