const db = require('../config/database');

const Economy = {
  getBalance: async (userId, guildId) => {
    const result = await db.query(
      'SELECT coins FROM user_economy WHERE user_id = $1 AND guild_id = $2',
      [userId, guildId]
    );
    if (!result.rows[0]) {
      await db.query(
        'INSERT INTO user_economy (user_id, guild_id, coins) VALUES ($1, $2, 0)',
        [userId, guildId]
      );
      return 0;
    }
    return result.rows[0].coins;
  },

  addCoins: async (userId, guildId, amount) => {
    await db.query(
      `INSERT INTO user_economy (user_id, guild_id, coins)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, guild_id) DO UPDATE SET
       coins = user_economy.coins + EXCLUDED.coins`,
      [userId, guildId, amount]
    );
  },

  claimDaily: async (userId, guildId, amount) => {
    const result = await db.query(
      'SELECT last_daily FROM user_economy WHERE user_id = $1 AND guild_id = $2',
      [userId, guildId]
    );
    
    if (result.rows[0]?.last_daily) {
      const lastDaily = new Date(result.rows[0].last_daily);
      const now = new Date();
      if (now.getTime() - lastDaily.getTime() < 24 * 60 * 60 * 1000) {
        return { success: false, remaining: 24 * 60 * 60 * 1000 - (now.getTime() - lastDaily.getTime()) };
      }
    }

    await db.query(
      `INSERT INTO user_economy (user_id, guild_id, coins, last_daily)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, guild_id) DO UPDATE SET
       coins = user_economy.coins + EXCLUDED.coins,
       last_daily = EXCLUDED.last_daily`,
      [userId, guildId, amount]
    );
    return { success: true };
  }
};

module.exports = Economy;
