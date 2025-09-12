import fetch from 'node-fetch';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface AIProvider {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  models: string[];
}

export class UniversalAIClient {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.setupProviders();
  }

  private setupProviders() {
    // OpenAI/ChatGPT
    this.providers.set('openai', {
      name: 'OpenAI',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    });

    // Anthropic/Claude
    this.providers.set('anthropic', {
      name: 'Anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseUrl: 'https://api.anthropic.com/v1',
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    });

    // Google/Gemini
    this.providers.set('google', {
      name: 'Google',
      apiKey: process.env.GOOGLE_API_KEY,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      models: ['gemini-pro', 'gemini-pro-vision'],
    });

    // Perplexity
    this.providers.set('perplexity', {
      name: 'Perplexity',
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseUrl: 'https://api.perplexity.ai',
      models: ['llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-huge-128k-online'],
    });

    // Ollama (local)
    this.providers.set('ollama', {
      name: 'Ollama',
      baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      models: ['llama2', 'llama3', 'mistral', 'codellama'],
    });
  }

  async chat(provider: string, model: string, messages: AIMessage[]): Promise<AIResponse> {
    const providerConfig = this.providers.get(provider);
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    switch (provider) {
      case 'openai':
        return await this.chatOpenAI(providerConfig, model, messages);
      case 'anthropic':
        return await this.chatAnthropic(providerConfig, model, messages);
      case 'google':
        return await this.chatGoogle(providerConfig, model, messages);
      case 'perplexity':
        return await this.chatPerplexity(providerConfig, model, messages);
      case 'ollama':
        return await this.chatOllama(providerConfig, model, messages);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async chatOpenAI(provider: AIProvider, model: string, messages: AIMessage[]): Promise<AIResponse> {
    if (!provider.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return {
      content: data.choices[0].message.content,
      model,
      provider: 'openai',
      usage: data.usage,
    };
  }

  private async chatAnthropic(provider: AIProvider, model: string, messages: AIMessage[]): Promise<AIResponse> {
    if (!provider.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Convert messages format for Claude
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${provider.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': provider.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        system: systemMessage?.content,
        messages: conversationMessages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return {
      content: data.content[0].text,
      model,
      provider: 'anthropic',
      usage: data.usage,
    };
  }

  private async chatGoogle(provider: AIProvider, model: string, messages: AIMessage[]): Promise<AIResponse> {
    if (!provider.apiKey) {
      throw new Error('Google API key not configured');
    }

    // Convert messages to Google format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(`${provider.baseUrl}/models/${model}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return {
      content: data.candidates[0].content.parts[0].text,
      model,
      provider: 'google',
      usage: data.usageMetadata,
    };
  }

  private async chatPerplexity(provider: AIProvider, model: string, messages: AIMessage[]): Promise<AIResponse> {
    if (!provider.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return {
      content: data.choices[0].message.content,
      model,
      provider: 'perplexity',
      usage: data.usage,
    };
  }

  private async chatOllama(provider: AIProvider, model: string, messages: AIMessage[]): Promise<AIResponse> {
    const response = await fetch(`${provider.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return {
      content: data.message.content,
      model,
      provider: 'ollama',
    };
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getProviderModels(provider: string): string[] {
    const providerConfig = this.providers.get(provider);
    return providerConfig ? providerConfig.models : [];
  }

  isProviderConfigured(provider: string): boolean {
    const providerConfig = this.providers.get(provider);
    if (!providerConfig) return false;

    // Check if API key is required and present
    switch (provider) {
      case 'openai':
        return !!providerConfig.apiKey;
      case 'anthropic':
        return !!providerConfig.apiKey;
      case 'google':
        return !!providerConfig.apiKey;
      case 'perplexity':
        return !!providerConfig.apiKey;
      case 'ollama':
        return true; // No API key required for local Ollama
      default:
        return false;
    }
  }
}