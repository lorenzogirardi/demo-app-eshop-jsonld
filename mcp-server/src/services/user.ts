import { PrismaClient } from '@prisma/client';
import { MetricsService } from '../metrics.js';

export class UserService {
  constructor(
    private prisma: PrismaClient,
    private metrics: MetricsService
  ) {}

  async getUsers(args: any) {
    const { limit = 50, offset = 0 } = args;

    const users = await this.metrics.timeOperation('select', 'users', async () => {
      return await this.prisma.user.findMany({
        take: limit,
        skip: offset,
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
        orderBy: { id: 'desc' },
      });
    });

    // Calculate user statistics
    const usersWithStats = users.map(user => ({
      ...user,
      stats: {
        totalCarts: user.Cart.length,
        totalCartItems: user.Cart.reduce(
          (sum, cart) => sum + cart.items.length,
          0
        ),
        totalCartValue: user.Cart.reduce(
          (sum, cart) => sum + cart.items.reduce(
            (cartSum, item) => cartSum + (item.product.price * item.quantity),
            0
          ),
          0
        ),
      },
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            users: usersWithStats,
            count: users.length,
            pagination: { limit, offset },
          }, null, 2),
        },
      ],
    };
  }

  async getUser(args: any) {
    const { id, email } = args;

    if (!id && !email) {
      throw new Error('Either id or email must be provided');
    }

    const where: any = {};
    if (id) where.id = id;
    if (email) where.email = email;

    const user = await this.metrics.timeOperation('select', 'users', async () => {
      return await this.prisma.user.findFirst({
        where,
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
          accounts: true,
          sessions: {
            where: {
              expires: {
                gt: new Date(),
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
      });
    });

    if (!user) {
      throw new Error(`User not found`);
    }

    // Calculate user statistics
    const userWithStats = {
      ...user,
      stats: {
        totalCarts: user.Cart.length,
        totalCartItems: user.Cart.reduce(
          (sum, cart) => sum + cart.items.length,
          0
        ),
        totalCartValue: user.Cart.reduce(
          (sum, cart) => sum + cart.items.reduce(
            (cartSum, item) => cartSum + (item.product.price * item.quantity),
            0
          ),
          0
        ),
        activeSessions: user.sessions.length,
        hasActiveSession: user.sessions.length > 0,
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(userWithStats, null, 2),
        },
      ],
    };
  }
}