const db = require('../config/database');

const Levels = {
  get: async (userId, guildId) => {
    const result = await db.query(
      'SELECT * FROM user_levels WHERE user_id = $1 AND guild_id = $2',
      [userId, guildId]
    );
    if (!result.rows[0]) {
      const newUser = await db.query(
        'INSERT INTO user_levels (user_id, guild_id, xp, level) VALUES ($1, $2, 0, 1) RETURNING *',
        [userId, guildId]
      );
      return newUser.rows[0];
    }
    return result.rows[0];
  },

  addXP: async (userId, guildId, amount) => {
    const user = await Levels.get(userId, guildId);
    let newXP = user.xp + amount;
    let newLevel = user.level;
    
    const xpToNextLevel = (level) => level * level * 100;
    
    while (newXP >= xpToNextLevel(newLevel)) {
      newXP -= xpToNextLevel(newLevel);
      newLevel++;
    }

    await db.query(
      'UPDATE user_levels SET xp = $1, level = $2 WHERE user_id = $3 AND guild_id = $4',
      [newXP, newLevel, userId, guildId]
    );
    
    return { leveledUp: newLevel > user.level, newLevel, newXP };
  },

  getXPToNext: (level) => level * level * 100
};

module.exports = Levels;
