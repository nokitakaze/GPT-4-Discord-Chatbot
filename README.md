# ChatGPT-5/Gemini 3 Pro/Grok 4 Discord Bot

<!-- {badges} -->

This repository hosts the code for a Discord bot that leverages the power of OpenAI ChatGPT, Google Gemini, and xAI Grok to
provide advanced conversational AI capabilities. Designed to facilitate dynamic interactions, the bot enriches Discord servers
with responsive and intelligent dialogues.

## Features

- The bot supports a dialogue mode with multiple users, distinguishes between users, and tracks the context of the dialogue
- It is possible to choose the bot's model
- Supports OpenAI, Google Gemini, and xAI models that are compatible with the Chat Completion API
- Google Gemini and xAI Grok models are configured to use online search capabilities by default
- Supports outputting a list of all available models from all configured providers at startup using the
  `GPT_SHOW_AVAILABLE_MODELS` environment variable

## Requirements

- Node.js (v22.13 or newer) / Docker
- Discord bot
- OpenAI API / Google Gemini API / xAI Grok API

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
3. Select the model to be used. By default, it is gpt-5.5.
   https://developers.openai.com/api/docs/models

### Google

1. Setup your Google AI Studio billing account.
   https://aistudio.google.com/app/billing
2. Create a new API Key.
   https://aistudio.google.com/app/apikey
3. Select the model to be used.
   https://ai.google.dev/gemini-api/docs/models

### xAI

1. Top up your xAI Console balance.
   https://console.x.ai/team/billing
2. Create a new API Key.
   https://console.x.ai/team/api-keys
3. Select the model to be used.
   https://docs.x.ai/developers/models

## Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/nokitakaze/GPT-4-Discord-Chatbot.git
    ```

2. Copy `.env.example` to `.env` and fill in your Discord bot token and API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   #GOOGLE_API_KEY=
   #XAI_API_KEY=
   #GPT_MODEL=gpt-5.5
   GPT_PROMPT="You are a helpful assistant. Respond briefly, but informatively."
   GPT_USE_ONLINE_SEARCH=1
   DISCORD_BOT_TOKEN=your_discord_bot_token
   ```

   Optionally set `GPT_MODEL` to the desired model from the lists below, just remember to set the corresponding API key (
   `OPENAI_API_KEY`, `GOOGLE_API_KEY`, or `XAI_API_KEY`):
    - OpenAI models: https://developers.openai.com/api/docs/models
    - Google models: https://ai.google.dev/gemini-api/docs/models
    - xAI models: https://docs.x.ai/developers/models

   Examples of full model names (including provider prefixes):
    - `openai/gpt-5.5`
    - `google/gemini-3.1-pro-preview`
    - `xai/grok-4.20-beta-0309-reasoning`

3. Start it with docker
   ```bash
   docker-compose up --build
   ```

   Or manually

   ```bash
   npm i
   npm start
   ```

## Configuration

You can customize the bot's behavior using the following environment variables in your `.env` file:

- `OPENAI_API_KEY` / `GOOGLE_API_KEY` / `XAI_API_KEY`: API keys for the respective providers.
- `GPT_MODEL`: The model to be used by the bot. You can prefix it with the provider (e.g., `openai/gpt-4.1`,
  `google/gemini-3.1-pro-preview`, `xai/grok-4.20-beta-0309-reasoning`). If no provider is specified, it defaults to OpenAI.
- `GPT_PROMPT`: The system prompt to define the bot's behavior and personality.
- `GPT_USE_ONLINE_SEARCH`: Controls whether Google Gemini and xAI Grok models use online search capabilities.
  Defaults to `1` (true). Set to `0` or `false` to disable.
- `DISCORD_BOT_TOKEN`: The token for your Discord bot.
- `GPT_SHOW_AVAILABLE_MODELS`: Set to `1`, `true`, or `yes` to output a list of all available models from your configured
  providers to the console during startup. Useful for discovering which models you can use.

## See also

- https://platform.openai.com/docs/guides/text-generation/chat-completions-api
- https://platform.openai.com/docs/api-reference/chat/create
- https://ai.google.dev/gemini-api/docs/text-generation
- https://ai.google.dev/api/generate-content
- https://docs.x.ai/docs/api-reference#chat
