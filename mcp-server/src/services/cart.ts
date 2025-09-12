import { PrismaClient } from '@prisma/client';
import { MetricsService } from '../metrics.js';

export class CartService {
  constructor(
    private prisma: PrismaClient,
    private metrics: MetricsService
  ) {}

  async getCart(args: any) {
    const { cartId, userId } = args;

    if (!cartId && !userId) {
      throw new Error('Either cartId or userId must be provided');
    }

    const cart = await this.metrics.timeOperation('select', 'carts', async () => {
      const where: any = {};
      if (cartId) where.id = cartId;
      if (userId) where.userId = userId;

      return await this.prisma.cart.findFirst({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          User: true,
        },
      });
    });

    if (!cart) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: 'Cart not found',
              cart: null,
            }, null, 2),
          },
        ],
      };
    }

    // Calculate cart totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            cart,
            summary: {
              totalItems,
              totalPrice,
              itemCount: cart.items.length,
            },
          }, null, 2),
        },
      ],
    };
  }

  async addToCart(args: any) {
    const { cartId, userId, productId, quantity = 1 } = args;

    // Find or create cart
    let cart;
    if (cartId) {
      cart = await this.prisma.cart.findUnique({ where: { id: cartId } });
      if (!cart) {
        throw new Error(`Cart with ID ${cartId} not found`);
      }
    } else if (userId) {
      cart = await this.prisma.cart.findFirst({ where: { userId } });
      if (!cart) {
        cart = await this.metrics.timeOperation('insert', 'carts', async () => {
          return await this.prisma.cart.create({
            data: { userId },
          });
        });
      }
    } else {
      // Create anonymous cart
      cart = await this.metrics.timeOperation('insert', 'carts', async () => {
        return await this.prisma.cart.create({
          data: {},
        });
      });
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await this.metrics.timeOperation('update', 'cartitems', async () => {
        return await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: { product: true },
        });
      });
    } else {
      // Create new cart item
      cartItem = await this.metrics.timeOperation('insert', 'cartitems', async () => {
        return await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
          include: { product: true },
        });
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Item added to cart successfully',
            cartItem,
            cartId: cart.id,
          }, null, 2),
        },
      ],
    };
  }

  async updateCartItem(args: any) {
    const { cartId, productId, quantity } = args;

    if (quantity <= 0) {
      return await this.removeFromCart({ cartId, productId });
    }

    const cartItem = await this.metrics.timeOperation('update', 'cartitems', async () => {
      return await this.prisma.cartItem.updateMany({
        where: {
          cartId,
          productId,
        },
        data: { quantity },
      });
    });

    if (cartItem.count === 0) {
      throw new Error('Cart item not found');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Cart item updated successfully',
            updatedCount: cartItem.count,
          }, null, 2),
        },
      ],
    };
  }

  async removeFromCart(args: any) {
    const { cartId, productId } = args;

    const result = await this.metrics.timeOperation('delete', 'cartitems', async () => {
      return await this.prisma.cartItem.deleteMany({
        where: {
          cartId,
          productId,
        },
      });
    });

    if (result.count === 0) {
      throw new Error('Cart item not found');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Item removed from cart successfully',
            removedCount: result.count,
          }, null, 2),
        },
      ],
    };
  }
}