module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`, error);
      
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            flags: 64
          });
        } else if (interaction.deferred) {
          await interaction.editReply({
            content: 'There was an error while executing this command!'
          });
        } else {
          await interaction.followUp({
            content: 'There was an error while executing this command!',
            flags: 64
          });
        }
      } catch (err) {
        console.error('Failed to send error response:', err.message);
      }
    }
  }
};