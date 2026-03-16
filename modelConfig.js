function getModelConfig(modelName, apiBaseUrl) {
    let systemRole = 'system';
    let noChatCompletionApi = false;
    let baseUrl = undefined;
    let actualModelName = modelName;
    let provider = '';

    const firstSlashIndex = modelName.indexOf('/');
    if (firstSlashIndex !== -1) {
        const prefix = modelName.substring(0, firstSlashIndex).toLowerCase();
        if (['openai', 'google', 'xai'].includes(prefix)) {
            provider = prefix;
            actualModelName = modelName.substring(firstSlashIndex + 1);
        }
    }

    const loweredActual = actualModelName.toLowerCase();

    if (!provider) {
        if (loweredActual.startsWith('gpt') || loweredActual.startsWith('chatgpt') || loweredActual.startsWith('o1') ||
            loweredActual.startsWith('o3') || loweredActual.startsWith('o4')) {
            provider = 'openai';
        } else if (loweredActual.startsWith('grok')) {
            provider = 'xai';
        } else if (loweredActual.startsWith('gemini')) {
            provider = 'google';
        } else {
            provider = 'openai'; // fallback
        }
    }

    // Determining system role
    const no_developer_messages = ['o1-mini', 'o1-preview',];
    const force_developer_models = ['o1', 'o3', 'o4',];

    let is_no_developer = false;
    let is_system_is_developer = false;

    for (let prefix of no_developer_messages) {
        if ((loweredActual === prefix) || loweredActual.startsWith(prefix + '-')) {
            is_no_developer = true;
            break;
        }
    }

    if (!is_no_developer) {
        for (let prefix of force_developer_models) {
            if ((loweredActual === prefix) || loweredActual.startsWith(prefix + '-')) {
                is_system_is_developer = true;
                break;
            }
        }
    }

    if (is_no_developer) {
        systemRole = 'user';
    } else if (is_system_is_developer) {
        systemRole = 'developer';
    }

    // Determining Chat Completion API usage
    const no_chat_completion_api_prefixes = ['o1-pro',];
    for (let prefix of no_chat_completion_api_prefixes) {
        if ((loweredActual === prefix) || loweredActual.startsWith(prefix + '-')) {
            noChatCompletionApi = true;
            break;
        }
    }

    // Determining Base URL
    if (provider === 'openai') {
        baseUrl = apiBaseUrl || 'https://api.openai.com/v1';
    } else if (provider === 'xai') {
        baseUrl = apiBaseUrl || 'https://api.x.ai/v1';
    } else if (provider === 'google') {
        baseUrl = apiBaseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai/';
    }

    return {
        actualModelName, provider, systemRole, baseUrl, noChatCompletionApi,
    };
}

async function showAvailableModels() {
    const show = process.env.SHOW_AVAILABLE_MODELS;
    if (!show || !['1', 'true', 'yes'].includes(String(show).toLowerCase())) {
        return;
    }

    const providers = [
        {
            name: 'OpenAI',
            key: process.env.OPENAI_API_KEY,
            url: 'https://api.openai.com/v1/models'
        }, {
            name: 'Google',
            key: process.env.GOOGLE_API_KEY,
            url: 'https://generativelanguage.googleapis.com/v1beta/openai/models'
        }, {
            name: 'X.AI',
            key: process.env.XAI_API_KEY,
            url: 'https://api.x.ai/v1/models'
        }
    ];

    for (const provider of providers) {
        if (!provider.key || provider.key.trim() === '') {
            continue;
        }

        try {
            const response = await fetch(provider.url, {
                headers: {
                    'Authorization': `Bearer ${provider.key}`
                }
            });

            if (!response.ok) {
                console.error(`Failed to fetch models from ${provider.name}: ${response.status} ${response.statusText}`);
                continue;
            }

            const data = await response.json();
            if (data && Array.isArray(data.data)) {
                console.log(`${provider.name}:`);
                const models = data.data
                    .map(m => m.id)
                    .filter(id => {
                        const lowerId = id.toLowerCase();
                        return !(lowerId.includes('tts') || lowerId.includes('dall-e') || lowerId.includes('whisper') ||
                                 lowerId.includes('embedding') || lowerId.includes('moderation') || lowerId.includes('audio') ||
                                 lowerId.includes('babbage') || lowerId.includes('davinci'));
                    })
                    .sort();

                for (const model of models) {
                    console.log(`- ${model}`);
                }
            }
        } catch (error) {
            console.error(`Error fetching models from ${provider.name}:`, error.message);
        }
    }
}

module.exports = {
    getModelConfig,
    showAvailableModels
};

