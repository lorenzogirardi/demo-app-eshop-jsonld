import { UniversalAIClient, AIMessage } from './universal-ai-client.js';
import { PrismaClient } from '@prisma/client';

export class AIAssistant {
  private aiClient: UniversalAIClient;
  private prisma: PrismaClient;
  private defaultProvider: string;
  private defaultModel: string;

  constructor(
    provider: string = 'ollama',
    model: string = 'llama2'
  ) {
    this.aiClient = new UniversalAIClient();
    this.prisma = new PrismaClient();
    this.defaultProvider = provider;
    this.defaultModel = model;
  }

  setProvider(provider: string, model: string) {
    this.defaultProvider = provider;
    this.defaultModel = model;
  }

  getAvailableProviders() {
    return this.aiClient.getAvailableProviders().map(provider => ({
      name: provider,
      models: this.aiClient.getProviderModels(provider),
      configured: this.aiClient.isProviderConfigured(provider),
    }));
  }

  async analyzeProductPerformance(productId?: string): Promise<string> {
    try {
      let products;
      if (productId) {
        products = await this.prisma.product.findUnique({
          where: { id: productId },
          include: {
            CartItem: {
              include: {
                cart: true,
              },
            },
          },
        });
        products = products ? [products] : [];
      } else {
        products = await this.prisma.product.findMany({
          include: {
            CartItem: {
              include: {
                cart: true,
              },
            },
          },
          take: 10,
          orderBy: {
            CartItem: {
              _count: 'desc',
            },
          },
        });
      }

      const productData = products.map(product => ({
        name: product.name,
        price: product.price,
        timesAddedToCart: product.CartItem.length,
        totalQuantityInCarts: product.CartItem.reduce((sum, item) => sum + item.quantity, 0),
        revenue: product.CartItem.reduce((sum, item) => sum + (product.price * item.quantity), 0),
      }));

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'You are an e-commerce analytics expert. Analyze the provided product performance data and provide insights and recommendations.',
        },
        {
          role: 'user',
          content: `Analyze this product performance data and provide insights:\n\n${JSON.stringify(productData, null, 2)}`,
        },
      ];

      const response = await this.aiClient.chat(this.defaultProvider, this.defaultModel, messages);
      return response.content;
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  async generateProductRecommendations(userId?: string): Promise<string> {
    try {
      let userContext = '';
      if (userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            Cart: {
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        });

        if (user) {
          const cartItems = user.Cart.flatMap(cart => cart.items);
          userContext = `User's cart history: ${JSON.stringify(
            cartItems.map(item => ({
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
            null,
            2
          )}`;
        }
      }

      const allProducts = await this.prisma.product.findMany({
        include: {
          CartItem: true,
        },
        take: 20,
      });

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'You are an e-commerce recommendation engine. Generate personalized product recommendations based on user behavior and product popularity.',
        },
        {
          role: 'user',
          content: `Generate product recommendations based on:\n\n${userContext}\n\nAvailable products:\n${JSON.stringify(
            allProducts.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              description: p.description,
              popularity: p.CartItem.length,
            })),
            null,
            2
          )}`,
        },
      ];

      const response = await this.aiClient.chat(this.defaultProvider, this.defaultModel, messages);
      return response.content;
    } catch (error) {
      throw new Error(`Recommendation generation failed: ${error.message}`);
    }
  }

  async analyzeCartAbandonment(): Promise<string> {
    try {
      const carts = await this.prisma.cart.findMany({
        where: {
          items: {
            some: {},
          },
          updatedAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24 hours
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          User: true,
        },
      });

      const abandonmentData = carts.map(cart => ({
        cartId: cart.id,
        userId: cart.userId,
        userName: cart.User?.name,
        itemCount: cart.items.length,
        totalValue: cart.items.reduce(
          (sum, item) => sum + (item.product.price * item.quantity),
          0
        ),
        daysSinceLastUpdate: Math.floor(
          (Date.now() - cart.updatedAt.getTime()) / (24 * 60 * 60 * 1000)
        ),
        items: cart.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      }));

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'You are an e-commerce analyst specializing in cart abandonment analysis. Provide insights and actionable recommendations to reduce cart abandonment.',
        },
        {
          role: 'user',
          content: `Analyze this cart abandonment data and provide insights:\n\n${JSON.stringify(abandonmentData, null, 2)}`,
        },
      ];

      const response = await this.aiClient.chat(this.defaultProvider, this.defaultModel, messages);
      return response.content;
    } catch (error) {
      throw new Error(`Cart abandonment analysis failed: ${error.message}`);
    }
  }

  async generateBusinessInsights(): Promise<string> {
    try {
      const [
        totalProducts,
        totalUsers,
        totalCarts,
        recentProducts,
        popularProducts,
      ] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.user.count(),
        this.prisma.cart.count(),
        this.prisma.product.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        this.prisma.product.findMany({
          include: {
            CartItem: true,
          },
          orderBy: {
            CartItem: {
              _count: 'desc',
            },
          },
          take: 5,
        }),
      ]);

      const businessData = {
        overview: {
          totalProducts,
          totalUsers,
          totalCarts,
          newProductsThisWeek: recentProducts,
        },
        topProducts: popularProducts.map(p => ({
          name: p.name,
          price: p.price,
          timesAddedToCart: p.CartItem.length,
        })),
      };

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'You are a business intelligence analyst for an e-commerce platform. Provide strategic insights and recommendations based on the business data.',
        },
        {
          role: 'user',
          content: `Analyze this business data and provide strategic insights:\n\n${JSON.stringify(businessData, null, 2)}`,
        },
      ];

      const response = await this.aiClient.chat(this.defaultProvider, this.defaultModel, messages);
      return response.content;
    } catch (error) {
      throw new Error(`Business insights generation failed: ${error.message}`);
    }
  }

  async chatWithData(query: string, context?: any, provider?: string, model?: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'You are an AI assistant for an e-commerce platform. You have access to product, user, and cart data. Answer questions and provide insights based on the available data.',
        },
        {
          role: 'user',
          content: context 
            ? `Context: ${JSON.stringify(context, null, 2)}\n\nQuestion: ${query}`
            : query,
        },
      ];

      const useProvider = provider || this.defaultProvider;
      const useModel = model || this.defaultModel;
      
      const response = await this.aiClient.chat(useProvider, useModel, messages);
      return response.content;
    } catch (error) {
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  async analyzeWithProvider(
    analysisType: 'product' | 'cart' | 'business' | 'recommendations',
    data: any,
    provider: string,
    model: string
  ): Promise<string> {
    try {
      let systemPrompt = '';
      let userPrompt = '';

      switch (analysisType) {
        case 'product':
          systemPrompt = 'You are an e-commerce analytics expert. Analyze product performance data and provide insights.';
          userPrompt = `Analyze this product data: ${JSON.stringify(data, null, 2)}`;
          break;
        case 'cart':
          systemPrompt = 'You are an e-commerce analyst specializing in cart behavior analysis.';
          userPrompt = `Analyze this cart data: ${JSON.stringify(data, null, 2)}`;
          break;
        case 'business':
          systemPrompt = 'You are a business intelligence analyst for an e-commerce platform.';
          userPrompt = `Analyze this business data: ${JSON.stringify(data, null, 2)}`;
          break;
        case 'recommendations':
          systemPrompt = 'You are an e-commerce recommendation engine.';
          userPrompt = `Generate recommendations based on: ${JSON.stringify(data, null, 2)}`;
          break;
      }

      const messages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const response = await this.aiClient.chat(provider, model, messages);
      return response.content;
    } catch (error) {
      throw new Error(`Analysis with ${provider} failed: ${error.message}`);
    }
  }
}