# GPT-4 Discord Bot

<!-- {badges} -->

This repository hosts the code for a Discord bot that leverages the power of OpenAI's GPT-4 to provide advanced conversational AI
capabilities. Designed to facilitate dynamic interactions, the bot enriches Discord servers with responsive and intelligent
dialogues.

## Features

- The bot supports a dialogue mode with multiple users, distinguishes between users, and tracks the context of the dialogue
- It is possible to choose the bot's model
- Supports OpenAI models that are compatible with the Chat Completion API, including **o1, o3, o4-mini, gpt-4, gpt-4.5, gpt-4.1, gpt-4o**

## Requirements

- Node.js (v22.13 or newer) / Docker
- Discord bot
- OpenAI API

### Discord

1. Create a new Discord bot https://discord.com/developers/applications
2. [Your bot] → Bot → "Reset token" button for acquiring your **secret token**
3. [Your bot] → Bot → Message content intent, Presence intent, Server members intent → "On"
4. https://discord.com/oauth2/authorize?client_id=[BOT_ID]&scope=bot&permissions=274878023680

### OpenAI

1. Top up your OpenAI API balance. Please note, this is not the balance of the main account.
   https://platform.openai.com/account/billing/overview
2. Create a new API Key. For simplicity, I use Permissions=All.
   https://platform.openai.com/api-keys
3. Select the model to be used. By default, it is gpt-4.1.
   https://platform.openai.com/docs/models

## Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/nokitakaze/GPT-4-Discord-Chatbot.git
    ```

2. Copy `.env.example` to `.env` and fill in your Discord bot token and OpenAI API key:
    ```
    OPENAI_API_KEY=your_openai_api_key
    #GPT_MODEL=gpt-4.1
    GPT_PROMPT="You are a helpful assistant. Respond briefly, but informatively."
    DISCORD_BOT_TOKEN=your_discord_bot_token
    ```
   Optionally set GPT_MODEL to the desired model: https://platform.openai.com/docs/models

3. Start it with docker
   ```bash
   docker-compose up --build
   ```

   Or manually

   ```bash
   npm i
   npm start
   ```

## See also

- https://platform.openai.com/docs/guides/text-generation/chat-completions-api
- https://platform.openai.com/docs/api-reference/chat/create
