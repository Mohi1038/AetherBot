const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

const COLORS = {
  bg: '#0F111A',
  cardBg: '#1A1D2E',
  accent: '#7289DA',
  text: '#FFFFFF',
  textSecondary: '#949BA4',
  online: '#43B581',
  idle: '#FAA61A',
  dnd: '#F04747',
  offline: '#747F8D'
};

function formatTime(totalMinutes) {
  if (!totalMinutes) return '0h 0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function drawRoundedImage(ctx, image, x, y, width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, x, y, width, height);
    ctx.restore();
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(' ');
    let line = '';
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
            lineCount++;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
    return lineCount + 1;
}

async function generateProfileCard(user, member, userData, studyData, levelData, economyData) {
  const width = 850; // Slightly wider
  const height = 500; // Slightly taller
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background with subtle pattern/gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, COLORS.bg);
  gradient.addColorStop(1, '#1A1C2C');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative element (Glassmorphism circle)
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = COLORS.accent;
  ctx.beginPath();
  ctx.arc(width - 50, 50, 250, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Main Card Area
  ctx.fillStyle = 'rgba(26, 29, 46, 0.9)';
  ctx.beginPath();
  ctx.roundRect(40, 40, width - 80, height - 80, 25);
  ctx.fill();
  ctx.strokeStyle = 'rgba(114, 137, 218, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Avatar with glow
  const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
  const avatar = await loadImage(avatarURL);
  
  ctx.shadowBlur = 15;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  drawRoundedImage(ctx, avatar, 80, 80, 160, 160, 40);
  ctx.shadowBlur = 0;

  // Status Indicator
  const statusLine = member?.presence?.status || 'offline';
  ctx.fillStyle = COLORS[statusLine] || COLORS.offline;
  ctx.beginPath();
  ctx.arc(215, 215, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.cardBg;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Typography
  ctx.textAlign = 'left';
  
  // Name & Level Badge
  ctx.font = 'bold 42px sans-serif';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(member.displayName || user.username, 280, 110);
  
  // Level Badge
  const levelText = `LEVEL ${levelData?.level || 1}`;
  ctx.font = 'bold 20px sans-serif';
  const levelWidth = ctx.measureText(levelText).width;
  ctx.fillStyle = COLORS.accent;
  ctx.roundRect(280, 130, levelWidth + 20, 35, 8);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(levelText, 290, 155);

  // XP Progress Bar
  const xp = levelData?.xp || 0;
  const level = levelData?.level || 1;
  const nextXP = level * level * 100;
  const progress = Math.min(xp / nextXP, 1);
  
  ctx.fillStyle = '#3E4253';
  ctx.beginPath();
  ctx.roundRect(280, 185, 500, 15, 10);
  ctx.fill();
  
  ctx.fillStyle = COLORS.accent;
  ctx.beginPath();
  ctx.roundRect(280, 185, 500 * progress, 15, 10);
  ctx.fill();
  
  ctx.font = '14px sans-serif';
  ctx.fillStyle = COLORS.textSecondary;
  ctx.fillText(`${xp} / ${nextXP} XP`, 700, 215);

  // About Me Section
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = COLORS.textSecondary;
  ctx.fillText('BIOGRAPHY', 280, 260);
  
  ctx.font = '20px sans-serif';
  ctx.fillStyle = COLORS.text;
  wrapText(ctx, userData?.about || 'No bio provided.', 280, 290, 500, 28);

  // Bottom Stats Row
  const studyTime = formatTime(studyData?.total_minutes);
  const coins = economyData || 0;

  const drawStat = (label, value, x) => {
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = COLORS.textSecondary;
    ctx.fillText(label, x, 400);
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(String(value), x, 435);
  };

  drawStat('STUDY FOCUS', studyTime, 80);
  drawStat('AETHER COINS', `🪙 ${coins}`, 320);
  drawStat('MEMBERSHIP', new Date(member.joinedTimestamp).toLocaleDateString(), 560);

  return canvas.toBuffer();
}

async function generateStatsCard(user, stats) {
  const width = 700;
  const height = 350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Modern Dark Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  // Glass Container
  ctx.fillStyle = COLORS.cardBg;
  ctx.beginPath();
  ctx.roundRect(30, 30, width - 60, height - 60, 30);
  ctx.fill();
  
  // Border Glow
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, COLORS.accent);
  grad.addColorStop(1, '#4E5D94');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
  drawRoundedImage(ctx, avatar, 60, 60, 140, 140, 35);

  ctx.font = 'bold 34px sans-serif';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(user.username, 230, 100);

  ctx.font = '20px sans-serif';
  ctx.fillStyle = COLORS.textSecondary;
  ctx.fillText('Personal Productivity Stats', 230, 130);

  // Stats Grid
  const drawMetric = (label, val, x, y) => {
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = COLORS.accent;
    ctx.fillText(label.toUpperCase(), x, y);
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(val, x, y + 35);
  };

  drawMetric('Total Focus Time', formatTime(stats?.total_minutes), 230, 190);
  drawMetric('Last Active', stats?.last_update ? new Date(stats.last_update).toLocaleDateString() : 'None', 480, 190);

  return canvas.toBuffer();
}

async function generateLeaderboardCard(guild, topUsers, client) {
  const width = 900;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  // Header Area
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(0, 0, width, 120);
  
  ctx.font = 'bold 42px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`${guild.name} Leaderboard`, width / 2, 75);

  // Leaderboard entries
  ctx.textAlign = 'left';
  let yPos = 180;
  
  for (let i = 0; i < topUsers.length; i++) {
    const data = topUsers[i];
    const user = await client.users.fetch(data.user_id).catch(() => null);
    const name = user ? user.username : `User ${data.user_id}`;
    
    // Alt row background
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(40, yPos - 35, width - 80, 50);
    }

    // Rank
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = i < 3 ? COLORS.idle : COLORS.textSecondary;
    ctx.fillText(`#${i + 1}`, 60, yPos);

    // Name
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(name, 150, yPos);

    // Time
    ctx.textAlign = 'right';
    ctx.font = '22px sans-serif';
    ctx.fillStyle = COLORS.accent;
    ctx.fillText(formatTime(data.total_minutes), width - 100, yPos);
    ctx.textAlign = 'left';

    yPos += 45;
  }

  return canvas.toBuffer();
}

module.exports = { generateProfileCard, generateStatsCard, generateLeaderboardCard };
 