const {Client, GatewayIntentBits, Partials, ActivityType} = require('discord.js');
const {OpenAI} = require('openai');

require('dotenv').config();

// noinspection JSUnresolvedReference
const client = new Client({
    partials: [Partials.Channel, Partials.Message],
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent,
              GatewayIntentBits.GuildMessages]
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GPT_MODEL = process.env.GPT_MODEL ?? "gpt-4";
const GPT_PROMPT = process.env.GPT_PROMPT ?? "You are a helpful assistant. Respond briefly, but informatively."

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const usefulMessagesLifetime = 7 * 24 * 3600 * 1000;
const unusefulMessagesLifetime = 24 * 3600 * 1000;

let botName;
const thisBotMessages = new Set();
const allMessages = {};

client.on('ready', () => {
    console.log(`Logged in`);
    console.log(`Bot ID: ${client.user.id}`);
    console.log(`Startup Time: ${new Date().toLocaleString()}`);
    console.log(`Serving on ${client.guilds.cache.size} servers`);
    console.log(`Observing ${client.users.cache.size} users`);
    botName = client.user.username;

    // https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-structure
    // You could see available types in gateway.d.ts
    // noinspection JSCheckFunctionSignatures,JSUnresolvedReference
    client.user.setPresence({
        status: 'online',
        activities: [{
            name: `${GPT_MODEL}. ${GPT_PROMPT}`,
            type: ActivityType.Custom,
            // details: "...details...", // GPT_PROMPT
            // state: "...state...",
            timestamps: {
                start: Date.now(),
            }
        }],
    });
});

client.on('messageCreate', async (/** @type {Message} */ message) => {
    allMessages[message.id] = {
        id: message.id,
        referenceMessageId: message.reference?.messageId ?? null,
        time: message.createdTimestamp,
        authorName: message.author.username,
        text: message.content,
    };

    if (message.author.bot) {
        // Author is a bot itself
        return;
    }

    const hasMentionMe = message.mentions.users.has(client.user.id);
    const answerToMe = (message.reference && thisBotMessages.has(message.reference.messageId));
    if (!hasMentionMe && !answerToMe) {
        // I can't answer to this message
        return;
    }

    console.log('At ', new Date(message.createdTimestamp), '. Message from user ', message.author.username,
        '. Text: ', message.content)
    const response = await generateResponse(message.id, OPENAI_API_KEY);
    // const newMessage = await message.channel.send(response);
    const newMessage = await message.reply(response);
    thisBotMessages.add(newMessage.id);
});

async function generateResponse(messageId) {
    try {
        const dialog = [];
        let lastChainId = messageId;
        while (true) {
            if (!allMessages.hasOwnProperty(lastChainId)) {
                break;
            }

            const message = allMessages[lastChainId];
            if (thisBotMessages.has(lastChainId)) {
                // This is THIS bot message
                dialog.push({
                    role: "assistant",
                    content: message.text,
                    name: botName,
                });
            } else {
                // This is user message
                dialog.push({
                    role: "user",
                    content: message.text,
                    name: message.authorName,
                });
            }

            if (message.referenceMessageId === null) {
                break;
            }

            lastChainId = message.referenceMessageId;
        }
        dialog.push({role: "system", content: GPT_PROMPT});

        /** https://platform.openai.com/docs/guides/text-generation/chat-completions-api */
        /** https://platform.openai.com/docs/api-reference/chat/create */
        const response = await openai.chat.completions.create({
            model: GPT_MODEL,
            messages: [...dialog].reverse(),
            max_tokens: 1024,
            n: 1
        });

        console.log('OpenAI response. Model', response.model, '. Text: ', response.choices[0].message.content);
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating response:', error.response ? error.response.data : error);
        if (error.error) {
            return `Sorry, I am unable to generate a response at this time ${error.error.type}: ${error.error.message}`;
        } else {
            return `Sorry, I am unable to generate a response at this time. ${error}`;
        }
    }
}

/**
 * Prints memory usage every hour indefinitely.
 *
 * @async
 * @return {void}
 */
async function infiniteDrawMemoryUsage() {
    await new Promise(resolve => setTimeout(resolve, 10 * 600 * 1000));
    // noinspection InfiniteLoopJS
    while (true) {
        console.log('Memory usage');
        const used = process.memoryUsage();
        for (let key in used) {
            console.log(`${key} ${Math.round(used[key] * (100 * 1024 / 1024)) / 100} MB`);
        }
        await new Promise(resolve => setTimeout(resolve, 3600000));
    }
}

async function infiniteCleanMessages() {
    // noinspection InfiniteLoopJS
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 3600000));
        // await new Promise(resolve => setTimeout(resolve, 1000));
        const prevMessagesCount = Object.keys(allMessages).length;
        if (Object.keys(allMessages).length === 0) {
            continue;
        }

        const usefulMessages = new Set();
        for (const messageId of [...thisBotMessages].reverse()) {
            let lastChainId = messageId;
            while (true) {
                if (usefulMessages.has(lastChainId)) {
                    // already processed
                    break;
                }

                if (!allMessages.hasOwnProperty(lastChainId)) {
                    // already deleted from allMessages
                    thisBotMessages.delete(lastChainId);
                    break;
                }

                usefulMessages.add(lastChainId);
                const message = allMessages[lastChainId];
                if (message.referenceMessageId === null) {
                    break;
                }

                lastChainId = message.referenceMessageId;
            }
        }

        const now = Date.now();
        const forDeletion = [];
        for (const messageId in allMessages) {
            const message = allMessages[messageId];
            const isUseful = usefulMessages.has(messageId);
            const lifetime = isUseful ? usefulMessagesLifetime : unusefulMessagesLifetime;

            if (message.time + lifetime < now) {
                forDeletion.push(messageId);
            }
        }

        for (const messageId of forDeletion) {
            allMessages.delete(messageId);
        }

        console.log(`${prevMessagesCount - Object.keys(allMessages).length} messages deleted`);
    }
}

// noinspection JSIgnoredPromiseFromCall
infiniteDrawMemoryUsage();
// noinspection JSIgnoredPromiseFromCall
infiniteCleanMessages();

client.login(DISCORD_BOT_TOKEN).then();
