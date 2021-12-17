# <img width=70 height=70 style="border-radius: 50%; align: center;" src="https://cdn.discordapp.com/avatars/845207738690437191/e22ed888457430485349304082bdfbd7.png?size=1024" /> <p>2TCli Discord Bot</p>
## Features
| Features   | Description                                                       |
|------------|-------------------------------------------------------------------|
| Moderation | Manages your Discord server                                       |
| Welcome    | Welcomes new users to your Discord server                         |
| Backup     | Backups your Discord server data and load in case of server raids |
| Economy    | A Discord Banking game for your Discord server                    |
| Games      | Some games for your Discord server members to play                |

> ℹ️ There are still more features rolling out for this bot, and will be updated in this repository!

> ⚠️  Most features of this bot uses Slash Commands

## Setup
1. Clone this repository
2. Create a `.env` file in the bot directory
3. Fill in the bot details like this:<br>
    ```environment
    # Discord Bot Configuration
    BOT_TOKEN=""
    BOT_PREFIX=""
    BOT_OWNER_ID=""

    # MongoDB Configuration
    DB_URI=""
    ```
4. Start your bot
    ```bash
    # Production
    npm run start

    # Development (nodemon)
    npm run test:nodemon

    # Development (ts-node-dev)
    npm run test:ts-node-dev
    ```

## Deploying to Railway
1. Fork this repository
2. Create a .env file in the bot directory
3. Fill in the bot details like this:<br>
    ```environment
    # Discord Bot Configuration
    BOT_TOKEN=""
    BOT_PREFIX=""
    BOT_OWNER_ID=""

    # MongoDB Configuration
    DB_URI=""
    ```
4. Head onto [Railway](https://railway.app) and login into your Github Account in Railway
5. On Railway, click on Dashboard
6. Click on `New Project`
7. Click on `Deploy from repo`
8. Search for 2TCli-Bot and click on it
9. Click on "Deploy"
