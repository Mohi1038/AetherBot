const { updateTime } = require('../models/StudyTime');
const Levels = require('../models/Levels');
const Economy = require('../models/Economy');

class TimeTracker {
  constructor() {
    this.sessions = new Map();
    this.intervals = new Map();
    console.log('🕒 TimeTracker initialized');
  }

  startTracking(member) {
    const key = `${member.guild.id}-${member.id}`;
    
    if (!this.sessions.has(key)) {
      console.log(`⌚ Started tracking ${member.user.tag}`);
      
      this.sessions.set(key, {
        member,
        startTime: Date.now(),
        lastUpdate: Date.now(),
        totalMinutes: 0
      });

      // Update every minute
      const interval = setInterval(async () => {
        await this.updateSession(member, 1);
      }, 60000);

      this.intervals.set(key, interval);
    }
  }

  stopTracking(member) {
    const key = `${member.guild.id}-${member.id}`;
    const session = this.sessions.get(key);
    
    if (session) {
      console.log(`⏹️ Stopping tracking for ${member.user.tag}`);
      
      // Final update
      const minutes = Math.floor((Date.now() - session.lastUpdate) / 60000);
      this.updateSession(member, minutes, true);
      
      // Cleanup
      clearInterval(this.intervals.get(key));
      this.intervals.delete(key);
      this.sessions.delete(key);
    }
  }

  async updateSession(member, minutes, isFinal = false) {
    if (minutes <= 0) return true;
    try {
      await updateTime(member.id, member.guild.id, minutes);
      
      // Reward XP and Coins: 10 XP and 2 Coins per minute
      const xpReward = minutes * 10;
      const coinReward = minutes * 2;
      
      await Levels.addXP(member.id, member.guild.id, xpReward);
      await Economy.addCoins(member.id, member.guild.id, coinReward);
      const key = `${member.guild.id}-${member.id}`;
      
      if (this.sessions.has(key)) {
        const session = this.sessions.get(key);
        session.totalMinutes += minutes;
        session.lastUpdate = Date.now();
        
        if (isFinal) {
          console.log(`💾 Saved final ${minutes} mins for ${member.user.tag}`);
        } else {
          console.log(`⏱️ Updated ${member.user.tag}: ${session.totalMinutes} mins`);
        }
      }
      return true;
    } catch (error) {
      console.error(`❌ Error updating ${member.user.tag}:`, error);
      return false;
    }
  }

  async saveAllSessions() {
    console.log('💾 Saving all active sessions...');
    const promises = [];
    
    for (const [key, session] of this.sessions) {
      const minutes = Math.floor((Date.now() - session.lastUpdate) / 60000);
      promises.push(this.updateSession(session.member, minutes, true));
      clearInterval(this.intervals.get(key));
    }
    
    await Promise.all(promises);
    this.sessions.clear();
    this.intervals.clear();
  }
}

module.exports = new TimeTracker();