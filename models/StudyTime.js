const db = require('../config/database');

// Test connection immediately
db.query('SELECT NOW()')
  .then(() => console.log('✅ StudyTime DB connection verified'))
  .catch(err => {
    console.error('❌ StudyTime DB connection failed:', err);
    process.exit(1);
  });

const StudyTime = {
  updateTime: async (userId, guildId, minutes) => {
    try {
      await db.query(
        `INSERT INTO user_study_time (user_id, guild_id, total_minutes, last_update)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, guild_id) DO UPDATE SET
         total_minutes = user_study_time.total_minutes + EXCLUDED.total_minutes,
         last_update = CURRENT_TIMESTAMP`,
        [userId, guildId, minutes]
      );
      return true;
    } catch (error) {
      console.error('UpdateTime error:', error);
      throw error;
    }
  },

  get: async (userId, guildId) => {
    try {
      const result = await db.query(
        'SELECT * FROM user_study_time WHERE user_id = $1 AND guild_id = $2',
        [userId, guildId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Get error:', error);
      throw error;
    }
  },

  getLeaderboard: async (guildId, limit = 10) => {
    try {
      const result = await db.query(
        'SELECT * FROM user_study_time WHERE guild_id = $1 ORDER BY total_minutes DESC LIMIT $2',
        [guildId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('GetLeaderboard error:', error);
      throw error;
    }
  }
};

// Lock the object to prevent modifications
module.exports = Object.freeze(StudyTime);