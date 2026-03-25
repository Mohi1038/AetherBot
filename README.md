# AetherBot 🌌

![AetherBot Banner](https://raw.githubusercontent.com/Mohi1038/AertherBot/main/logo.png)

<p align="center">
  <strong>A premium Discord companion for productivity, study tracking, and community engagement.</strong>
  <br />
  Featuring glassmorphism-inspired profile cards, a robust economy, and deep leveling systems.
  <br />
  <br />
  <a href="https://github.com/Mohi1038/AertherBot/issues">Report Bug</a>
  ·
  <a href="https://github.com/Mohi1038/AertherBot/issues">Request Feature</a>
</p>

---

## ✨ Key Features

### 🕒 Smart Productivity Tracking
*   **Automatic Study Sessions**: Tracks time spent in voice channels or via active commands.
*   **XP & Leveling**: Earn XP for every minute you focus. Level up to become a "Study Star".
*   **Detailed Analytics**: View your study history and session highlights with `/stats`.

### 🎴 Professional Card Generation
*   **Glassmorphism Design**: High-end, visually stunning profile and stats cards generated on-the-fly.
*   **Dynamic Data**: Showcases your level, XP progress, coin balance, and membership status.

### 💰 Economy & Rewards
*   **Aether Coins**: Earn currency while you study or via `/economy daily`.
*   **Gambling**: Risk your coins in `/economy coinflip` to climb the wealthy ranks.
*   **Economy Leaderboard**: See who's the richest in the server with `/leaderboard`.

### 📋 Organization Tools
*   **Universal To-Do**: Manage personal tasks with deadlines using `/todo`.
*   **Reminders**: Set one-time or recurring study reminders to keep your schedule on track.

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) v18.0.0 or higher
*   [Supabase](https://supabase.com/) account (PostgreSQL)

### Installation

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/Mohi1038/AertherBot.git
    cd AertherBot
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Environmental Configuration**
    Create a `.env` file in the root directory:
    ```env
    DISCORD_TOKEN=your_bot_token
    CLIENT_ID=your_client_id
    DATABASE_URL=your_supabase_connection_string
    ```

4.  **Database Initialization**
    Copy the contents of `supabase-schema.sql` into the Supabase SQL Editor and execute.

5.  **Deploy Commands**
    ```sh
    node deploy-commands.js
    ```

6.  **Launch**
    ```sh
    npm start
    ```

---

## 🛠️ Commands Reference

### 👤 Profile & Stats
| Command | Description |
| :--- | :--- |
| `/profile view [user]` | Displays the premium profile card of a user. |
| `/profile edit <about>` | Customizes your biography section on the card. |
| `/stats [user]` | Shows detailed study time and focus metrics. |
| `/leaderboard` | Displays the top 10 students in the server. |

### 💰 Economy
| Command | Description |
| :--- | :--- |
| `/economy daily` | Claims your daily 100 Aether Coins. |
| `/economy balance` | Checks your current coin stash. |
| `/economy coinflip <amount>`| Gambles coins on a heads-or-tails flip. |

### 📅 To-Do & Reminders
| Command | Description |
| :--- | :--- |
| `/todo add <task> [date]` | Adds a task with an optional deadline. |
| `/todo list` | Views your current active tasks. |
| `/todo complete` | Marks a task as finished. |
| `/reminder <duration>` | Sets a one-time reminder (e.g., 25m for Pomodoro). |

---

## 🌐 Deployment (Render)

AetherBot is optimized for deployment on platforms like Render:

1.  Connect your GitHub repository to Render.
2.  Set **Build Command** to `npm install`.
3.  Set **Start Command** to `node bot.js`.
4.  Configure the environment variables (`DATABASE_URL`, `DISCORD_TOKEN`, etc.) in the Render dashboard.

> [!TIP]
> Ensure your Supabase connection string uses the **transaction pooler** (port 6543) for best performance on serverless environments.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve AetherBot:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

## 📫 Contact
**Mohit Meemruath** - [GitHub](https://github.com/Mohi1038)
