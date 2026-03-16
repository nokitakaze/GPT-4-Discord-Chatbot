const {OpenAI} = require('openai');
const {GoogleGenAI} = require('@google/genai');
const {createXai} = require('@ai-sdk/xai');
const {generateText} = require('ai');

class IGptClient {
    /**
     * @param {Object} environment
     */
    constructor(environment) {
        this.environment = environment;
    }

    /**
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async createChatCompletion(options) {
        throw new Error("Method 'createChatCompletion()' must be implemented.");
    }
}

class OpenAiClient extends IGptClient {
    constructor(environment) {
        super(environment);
        // noinspection JSUnresolvedReference
        this.client = new OpenAI({
            apiKey: environment.OPENAI_API_KEY,
            baseURL: environment.API_BASE_URL || 'https://api.openai.com/v1',
        });
    }

    async createChatCompletion(options) {
        /** https://platform.openai.com/docs/guides/text?api-mode=chat */
        /** https://platform.openai.com/docs/api-reference/chat/create */
        // noinspection ES6RedundantAwait,JSCheckFunctionSignatures
        return await this.client.chat.completions.create(options);
    }
}

class GoogleClient extends IGptClient {
    constructor(environment) {
        super(environment);
        // noinspection JSUnresolvedReference
        this.client = new GoogleGenAI({
            apiKey: environment.GOOGLE_API_KEY,
        });
    }

    canUseSearch() {
        // noinspection JSUnresolvedReference
        return this.environment.GPT_USE_ONLINE_SEARCH === undefined ||
               ['1', 'yes', 'true'].includes(String(this.environment.GPT_USE_ONLINE_SEARCH).toLowerCase());
    }

    async createChatCompletion(options) {
        const systemInstructionParts = [];
        const contents = [];

        for (const msg of options.messages) {
            let role = msg.role;
            let text = '';

            if (Array.isArray(msg.content)) {
                text = msg.content.map(c => c.text || JSON.stringify(c)).join('\n');
            } else {
                text = msg.content;
            }

            if (role === 'system' || role === 'developer') {
                systemInstructionParts.push(text);
            } else {
                contents.push({
                    role: role === 'assistant' ? 'model' : 'user',
                    parts: [{text}]
                });
            }
        }

        const config = {};
        if (systemInstructionParts.length > 0) {
            config.systemInstruction = systemInstructionParts.join('\n');
        }

        if (options.max_completion_tokens) {
            config.maxOutputTokens = options.max_completion_tokens;
        }

        if (this.canUseSearch()) {
            config.tools = [{googleSearch: {}}];
        }

        const response = await this.client.models.generateContent({
            model: options.model,
            contents: contents,
            config: config
        });

        return {
            model: options.model,
            choices: [
                {
                    message: {
                        content: response.text
                    }
                }
            ]
        };
    }
}

class XaiClient extends IGptClient {
    constructor(environment) {
        super(environment);
        // noinspection JSUnresolvedReference
        this.client = createXai({
            apiKey: environment.XAI_API_KEY,
            baseURL: environment.API_BASE_URL || 'https://api.x.ai/v1',
        });
    }

    canUseSearch() {
        // noinspection JSUnresolvedReference
        return this.environment.GPT_USE_ONLINE_SEARCH === undefined ||
               ['1', 'yes', 'true'].includes(String(this.environment.GPT_USE_ONLINE_SEARCH).toLowerCase());
    }

    async createChatCompletion(options) {
        const messages = options.messages.map(msg => {
            let text;
            if (Array.isArray(msg.content)) {
                text = msg.content.map(c => c.text || JSON.stringify(c)).join('\n');
            } else {
                text = msg.content;
            }

            return {
                role: msg.role === 'developer' ? 'system' : msg.role,
                content: text
            };
        });

        const {webSearch, xSearch} = require('@ai-sdk/xai');

        const generateOptions = {
            model: this.client.responses(options.model),
            messages: messages,
        };

        if (options.max_completion_tokens) {
            generateOptions.maxTokens = options.max_completion_tokens;
        }

        if (this.canUseSearch()) {
            generateOptions.tools = {
                webSearch: webSearch(),
                xSearch: xSearch()
            };
            generateOptions.maxSteps = 5;
        }

        const result = await generateText(generateOptions);

        return {
            model: options.model,
            choices: [
                {
                    message: {
                        content: result.text
                    }
                }
            ]
        };
    }
}

module.exports = {
    IGptClient,
    OpenAiClient,
    GoogleClient,
    XaiClient
};
