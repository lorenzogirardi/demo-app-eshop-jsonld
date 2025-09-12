import { PrismaClient } from '@prisma/client';
import { MetricsService } from '../metrics.js';

export class AnalyticsService {
  constructor(
    private prisma: PrismaClient,
    private metrics: MetricsService
  ) {}

  async getAnalytics(args: any) {
    const { type = 'overview', startDate, endDate } = args;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    switch (type) {
      case 'overview':
        return await this.getOverviewAnalytics(dateFilter);
      case 'products':
        return await this.getProductAnalytics(dateFilter);
      case 'users':
        return await this.getUserAnalytics(dateFilter);
      case 'carts':
        return await this.getCartAnalytics(dateFilter);
      default:
        throw new Error(`Unknown analytics type: ${type}`);
    }
  }

  private async getOverviewAnalytics(dateFilter: any) {
    const [
      totalProducts,
      totalUsers,
      totalCarts,
      totalCartItems,
      recentProducts,
      recentUsers,
      recentCarts,
    ] = await Promise.all([
      this.metrics.timeOperation('count', 'products', () =>
        this.prisma.product.count({
          where: dateFilter.gte ? { createdAt: dateFilter } : undefined,
        })
      ),
      this.metrics.timeOperation('count', 'users', () =>
        this.prisma.user.count()
      ),
      this.metrics.timeOperation('count', 'carts', () =>
        this.prisma.cart.count({
          where: dateFilter.gte ? { createdAt: dateFilter } : undefined,
        })
      ),
      this.metrics.timeOperation('count', 'cartitems', () =>
        this.prisma.cartItem.count()
      ),
      this.metrics.timeOperation('select', 'products', () =>
        this.prisma.product.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        })
      ),
      this.metrics.timeOperation('select', 'users', () =>
        this.prisma.user.count()
      ),
      this.metrics.timeOperation('select', 'carts', () =>
        this.prisma.cart.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        })
      ),
    ]);

    // Calculate total cart value
    const cartValues = await this.metrics.timeOperation('select', 'cartitems', async () => {
      return await this.prisma.cartItem.findMany({
        include: {
          product: true,
        },
      });
    });

    const totalCartValue = cartValues.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    const analytics = {
      overview: {
        totalProducts,
        totalUsers,
        totalCarts,
        totalCartItems,
        totalCartValue,
        averageCartValue: totalCarts > 0 ? totalCartValue / totalCarts : 0,
      },
      recent: {
        productsLast7Days: recentProducts,
        cartsLast7Days: recentCarts,
      },
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(analytics, null, 2),
        },
      ],
    };
  }

  private async getProductAnalytics(dateFilter: any) {
    const [products, popularProducts] = await Promise.all([
      this.metrics.timeOperation('select', 'products', () =>
        this.prisma.product.findMany({
          where: dateFilter.gte ? { createdAt: dateFilter } : undefined,
          include: {
            CartItem: true,
            _count: {
              select: {
                CartItem: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      ),
      this.metrics.timeOperation('select', 'products', () =>
        this.prisma.product.findMany({
          include: {
            CartItem: true,
            _count: {
              select: {
                CartItem: true,
              },
            },
          },
          orderBy: {
            CartItem: {
              _count: 'desc',
            },
          },
          take: 10,
        })
      ),
    ]);

    const productAnalytics = products.map(product => ({
      ...product,
      analytics: {
        timesAddedToCart: product._count.CartItem,
        totalQuantityInCarts: product.CartItem.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        revenue: product.CartItem.reduce(
          (sum, item) => sum + (product.price * item.quantity),
          0
        ),
      },
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            products: productAnalytics,
            popularProducts: popularProducts.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              timesAddedToCart: p._count.CartItem,
            })),
            summary: {
              totalProducts: products.length,
              averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
            },
          }, null, 2),
        },
      ],
    };
  }

  private async getUserAnalytics(dateFilter: any) {
    const users = await this.metrics.timeOperation('select', 'users', () =>
      this.prisma.user.findMany({
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
          _count: {
            select: {
              accounts: true,
              sessions: true,
            },
          },
        },
      })
    );

    const userAnalytics = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      analytics: {
        totalCarts: user.Cart.length,
        totalCartItems: user.Cart.reduce(
          (sum, cart) => sum + cart.items.length,
          0
        ),
        totalSpent: user.Cart.reduce(
          (sum, cart) => sum + cart.items.reduce(
            (cartSum, item) => cartSum + (item.product.price * item.quantity),
            0
          ),
          0
        ),
        accountsCount: user._count.accounts,
        sessionsCount: user._count.sessions,
      },
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            users: userAnalytics,
            summary: {
              totalUsers: users.length,
              averageCartsPerUser: users.reduce((sum, u) => sum + u.Cart.length, 0) / users.length,
              totalRevenue: userAnalytics.reduce((sum, u) => sum + u.analytics.totalSpent, 0),
            },
          }, null, 2),
        },
      ],
    };
  }

  private async getCartAnalytics(dateFilter: any) {
    const carts = await this.metrics.timeOperation('select', 'carts', () =>
      this.prisma.cart.findMany({
        where: dateFilter.gte ? { createdAt: dateFilter } : undefined,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          User: true,
        },
      })
    );

    const cartAnalytics = carts.map(cart => ({
      id: cart.id,
      userId: cart.userId,
      userName: cart.User?.name,
      createdAt: cart.createdAt,
      analytics: {
        itemCount: cart.items.length,
        totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: cart.items.reduce(
          (sum, item) => sum + (item.product.price * item.quantity),
          0
        ),
        averageItemPrice: cart.items.length > 0 
          ? cart.items.reduce((sum, item) => sum + item.product.price, 0) / cart.items.length
          : 0,
      },
    }));

    const abandonedCarts = cartAnalytics.filter(cart => 
      cart.analytics.itemCount > 0 && 
      new Date(cart.createdAt).getTime() < Date.now() - (24 * 60 * 60 * 1000) // Older than 24 hours
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            carts: cartAnalytics,
            summary: {
              totalCarts: carts.length,
              activeCarts: cartAnalytics.filter(c => c.analytics.itemCount > 0).length,
              abandonedCarts: abandonedCarts.length,
              averageCartValue: cartAnalytics.reduce((sum, c) => sum + c.analytics.totalValue, 0) / carts.length,
              totalRevenue: cartAnalytics.reduce((sum, c) => sum + c.analytics.totalValue, 0),
            },
          }, null, 2),
        },
      ],
    };
  }
}