#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { MetricsService } from './metrics.js';
import { ProductService } from './services/product.js';
import { CartService } from './services/cart.js';
import { UserService } from './services/user.js';
import { AnalyticsService } from './services/analytics.js';
import { AIAssistant } from './ai-integration/ai-assistant.js';

const prisma = new PrismaClient();
const metricsService = new MetricsService();
const productService = new ProductService(prisma, metricsService);
const cartService = new CartService(prisma, metricsService);
const userService = new UserService(prisma, metricsService);
const analyticsService = new AnalyticsService(prisma, metricsService);
const aiAssistant = new AIAssistant();

const server = new Server(
  {
    name: 'ecommerce-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  // Product Management Tools
  {
    name: 'get_products',
    description: 'Get all products or filter by criteria',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of products to return' },
        offset: { type: 'number', description: 'Number of products to skip' },
        search: { type: 'string', description: 'Search term for product name or description' },
        minPrice: { type: 'number', description: 'Minimum price filter' },
        maxPrice: { type: 'number', description: 'Maximum price filter' },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get a specific product by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Product ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_product',
    description: 'Create a new product',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name' },
        description: { type: 'string', description: 'Product description' },
        price: { type: 'number', description: 'Product price in cents' },
        imageUrl: { type: 'string', description: 'Product image URL' },
      },
      required: ['name', 'description', 'price', 'imageUrl'],
    },
  },
  {
    name: 'update_product',
    description: 'Update an existing product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Product ID' },
        name: { type: 'string', description: 'Product name' },
        description: { type: 'string', description: 'Product description' },
        price: { type: 'number', description: 'Product price in cents' },
        imageUrl: { type: 'string', description: 'Product image URL' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_product',
    description: 'Delete a product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Product ID' },
      },
      required: ['id'],
    },
  },

  // Cart Management Tools
  {
    name: 'get_cart',
    description: 'Get cart by ID or user ID',
    inputSchema: {
      type: 'object',
      properties: {
        cartId: { type: 'string', description: 'Cart ID' },
        userId: { type: 'string', description: 'User ID' },
      },
    },
  },
  {
    name: 'add_to_cart',
    description: 'Add item to cart',
    inputSchema: {
      type: 'object',
      properties: {
        cartId: { type: 'string', description: 'Cart ID' },
        userId: { type: 'string', description: 'User ID (if no cartId provided)' },
        productId: { type: 'string', description: 'Product ID' },
        quantity: { type: 'number', description: 'Quantity to add', default: 1 },
      },
      required: ['productId'],
    },
  },
  {
    name: 'update_cart_item',
    description: 'Update cart item quantity',
    inputSchema: {
      type: 'object',
      properties: {
        cartId: { type: 'string', description: 'Cart ID' },
        productId: { type: 'string', description: 'Product ID' },
        quantity: { type: 'number', description: 'New quantity' },
      },
      required: ['cartId', 'productId', 'quantity'],
    },
  },
  {
    name: 'remove_from_cart',
    description: 'Remove item from cart',
    inputSchema: {
      type: 'object',
      properties: {
        cartId: { type: 'string', description: 'Cart ID' },
        productId: { type: 'string', description: 'Product ID' },
      },
      required: ['cartId', 'productId'],
    },
  },

  // User Management Tools
  {
    name: 'get_users',
    description: 'Get all users with pagination',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of users to return' },
        offset: { type: 'number', description: 'Number of users to skip' },
      },
    },
  },
  {
    name: 'get_user',
    description: 'Get user by ID or email',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'User ID' },
        email: { type: 'string', description: 'User email' },
      },
    },
  },

  // Analytics Tools
  {
    name: 'get_analytics',
    description: 'Get business analytics and metrics',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['overview', 'products', 'users', 'carts'],
          description: 'Type of analytics to retrieve',
        },
        startDate: { type: 'string', description: 'Start date (ISO string)' },
        endDate: { type: 'string', description: 'End date (ISO string)' },
      },
    },
  },

  // Monitoring Tools
  {
    name: 'get_metrics',
    description: 'Get Prometheus metrics',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['prometheus', 'json'],
          description: 'Output format for metrics',
          default: 'json',
        },
      },
    },
  },
  {
    name: 'health_check',
    description: 'Check system health status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // AI Tools
  {
    name: 'ai_analyze_products',
    description: 'AI analysis of product performance using any AI provider',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'Specific product ID to analyze (optional)' },
        provider: { 
          type: 'string', 
          enum: ['openai', 'anthropic', 'google', 'perplexity', 'ollama'],
          description: 'AI provider to use',
          default: 'ollama'
        },
        model: { type: 'string', description: 'Model to use (provider-specific)' },
      },
    },
  },
  {
    name: 'ai_generate_recommendations',
    description: 'Generate product recommendations using AI',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID for personalized recommendations (optional)' },
        provider: { 
          type: 'string', 
          enum: ['openai', 'anthropic', 'google', 'perplexity', 'ollama'],
          description: 'AI provider to use',
          default: 'ollama'
        },
        model: { type: 'string', description: 'Model to use (provider-specific)' },
      },
    },
  },
  {
    name: 'ai_analyze_cart_abandonment',
    description: 'AI analysis of cart abandonment patterns',
    inputSchema: {
      type: 'object',
      properties: {
        provider: { 
          type: 'string', 
          enum: ['openai', 'anthropic', 'google', 'perplexity', 'ollama'],
          description: 'AI provider to use',
          default: 'ollama'
        },
        model: { type: 'string', description: 'Model to use (provider-specific)' },
      },
    },
  },
  {
    name: 'ai_business_insights',
    description: 'Generate business insights using AI',
    inputSchema: {
      type: 'object',
      properties: {
        provider: { 
          type: 'string', 
          enum: ['openai', 'anthropic', 'google', 'perplexity', 'ollama'],
          description: 'AI provider to use',
          default: 'ollama'
        },
        model: { type: 'string', description: 'Model to use (provider-specific)' },
      },
    },
  },
  {
    name: 'ai_chat',
    description: 'Chat with AI about e-commerce data',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Question or query for the AI' },
        context: { type: 'object', description: 'Additional context data (optional)' },
        provider: { 
          type: 'string', 
          enum: ['openai', 'anthropic', 'google', 'perplexity', 'ollama'],
          description: 'AI provider to use',
          default: 'ollama'
        },
        model: { type: 'string', description: 'Model to use (provider-specific)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'ai_providers',
    description: 'List available AI providers and their configuration status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Product Management
      case 'get_products':
        return await productService.getProducts(args);
      case 'get_product':
        return await productService.getProduct(args.id);
      case 'create_product':
        return await productService.createProduct(args);
      case 'update_product':
        return await productService.updateProduct(args);
      case 'delete_product':
        return await productService.deleteProduct(args.id);

      // Cart Management
      case 'get_cart':
        return await cartService.getCart(args);
      case 'add_to_cart':
        return await cartService.addToCart(args);
      case 'update_cart_item':
        return await cartService.updateCartItem(args);
      case 'remove_from_cart':
        return await cartService.removeFromCart(args);

      // User Management
      case 'get_users':
        return await userService.getUsers(args);
      case 'get_user':
        return await userService.getUser(args);

      // Analytics
      case 'get_analytics':
        return await analyticsService.getAnalytics(args);

      // Monitoring
      case 'get_metrics':
        return await metricsService.getMetrics(args.format);
      case 'health_check':
        return await healthCheck();

      // AI Tools
      case 'ai_analyze_products':
        return await aiAnalyzeProducts(args);
      case 'ai_generate_recommendations':
        return await aiGenerateRecommendations(args);
      case 'ai_analyze_cart_abandonment':
        return await aiAnalyzeCartAbandonment(args);
      case 'ai_business_insights':
        return await aiBusinessInsights(args);
      case 'ai_chat':
        return await aiChat(args);
      case 'ai_providers':
        return await aiProviders();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    metricsService.incrementErrorCounter(name, error.message);
    throw error;
  }
});

async function healthCheck() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        metrics: 'healthy',
      },
      uptime: process.uptime(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  } catch (error) {
    const status = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: 'unhealthy',
        metrics: 'healthy',
      },
      uptime: process.uptime(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  }
}

// AI Tool Functions
async function aiAnalyzeProducts(args: any) {
  const { productId, provider = 'ollama', model } = args;
  
  // Set provider and model if specified
  if (provider && model) {
    aiAssistant.setProvider(provider, model);
  }
  
  const analysis = await aiAssistant.analyzeProductPerformance(productId);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          analysis,
          provider,
          model: model || 'default',
          timestamp: new Date().toISOString(),
        }, null, 2),
      },
    ],
  };
}

async function aiGenerateRecommendations(args: any) {
  const { userId, provider = 'ollama', model } = args;
  
  if (provider && model) {
    aiAssistant.setProvider(provider, model);
  }
  
  const recommendations = await aiAssistant.generateProductRecommendations(userId);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          recommendations,
          provider,
          model: model || 'default',
          timestamp: new Date().toISOString(),
        }, null, 2),
      },
    ],
  };
}

async function aiAnalyzeCartAbandonment(args: any) {
  const { provider = 'ollama', model } = args;
  
  if (provider && model) {
    aiAssistant.setProvider(provider, model);
  }
  
  const analysis = await aiAssistant.analyzeCartAbandonment();
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          analysis,
          provider,
          model: model || 'default',
          timestamp: new Date().toISOString(),
        }, null, 2),
      },
    ],
  };
}

async function aiBusinessInsights(args: any) {
  const { provider = 'ollama', model } = args;
  
  if (provider && model) {
    aiAssistant.setProvider(provider, model);
  }
  
  const insights = await aiAssistant.generateBusinessInsights();
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          insights,
          provider,
          model: model || 'default',
          timestamp: new Date().toISOString(),
        }, null, 2),
      },
    ],
  };
}

async function aiChat(args: any) {
  const { query, context, provider = 'ollama', model } = args;
  
  const response = await aiAssistant.chatWithData(query, context, provider, model);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          query,
          response,
          provider,
          model: model || 'default',
          timestamp: new Date().toISOString(),
        }, null, 2),
      },
    ],
  };
}

async function aiProviders() {
  const providers = aiAssistant.getAvailableProviders();
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          providers,
          timestamp: new Date().toISOString(),
        }, null, 2),
      },
    ],
  };
}

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('E-commerce MCP Server running on stdio');
}

runServer().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});