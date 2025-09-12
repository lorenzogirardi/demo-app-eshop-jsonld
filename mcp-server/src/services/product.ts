import { PrismaClient } from '@prisma/client';
import { MetricsService } from '../metrics.js';

export class ProductService {
  constructor(
    private prisma: PrismaClient,
    private metrics: MetricsService
  ) {}

  async getProducts(args: any) {
    const { limit = 50, offset = 0, search, minPrice, maxPrice } = args;

    const products = await this.metrics.timeOperation('select', 'products', async () => {
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      return await this.prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            products,
            count: products.length,
            pagination: { limit, offset },
          }, null, 2),
        },
      ],
    };
  }

  async getProduct(id: string) {
    const product = await this.metrics.timeOperation('select', 'products', async () => {
      return await this.prisma.product.findUnique({
        where: { id },
        include: {
          CartItem: {
            include: {
              cart: true,
            },
          },
        },
      });
    });

    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(product, null, 2),
        },
      ],
    };
  }

  async createProduct(args: any) {
    const { name, description, price, imageUrl } = args;

    const product = await this.metrics.timeOperation('insert', 'products', async () => {
      return await this.prisma.product.create({
        data: {
          name,
          description,
          price,
          imageUrl,
        },
      });
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Product created successfully',
            product,
          }, null, 2),
        },
      ],
    };
  }

  async updateProduct(args: any) {
    const { id, ...updateData } = args;

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    const product = await this.metrics.timeOperation('update', 'products', async () => {
      return await this.prisma.product.update({
        where: { id },
        data: cleanUpdateData,
      });
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Product updated successfully',
            product,
          }, null, 2),
        },
      ],
    };
  }

  async deleteProduct(id: string) {
    await this.metrics.timeOperation('delete', 'products', async () => {
      return await this.prisma.product.delete({
        where: { id },
      });
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Product deleted successfully',
            id,
          }, null, 2),
        },
      ],
    };
  }
}