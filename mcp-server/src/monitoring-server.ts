#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { register } from 'prom-client';
import { PrismaClient } from '@prisma/client';
import { MetricsService } from './metrics.js';

const app = express();
const port = process.env.MONITORING_PORT || 9090;
const prisma = new PrismaClient();
const metricsService = new MetricsService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        metrics: 'healthy',
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: 'unhealthy',
        metrics: 'healthy',
      },
      uptime: process.uptime(),
    });
  }
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

// API endpoints for AI chatbot integration
app.get('/api/products', async (req, res) => {
  try {
    const { limit = 50, offset = 0, search, minPrice, maxPrice } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = parseInt(minPrice as string);
      if (maxPrice !== undefined) where.price.lte = parseInt(maxPrice as string);
    }
    
    const products = await metricsService.timeOperation('select', 'products', async () => {
      return await prisma.product.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { createdAt: 'desc' },
      });
    });
    
    res.json({
      products,
      count: products.length,
      pagination: { limit: parseInt(limit as string), offset: parseInt(offset as string) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalCarts,
      totalCartItems,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.cart.count(),
      prisma.cartItem.count(),
    ]);

    // Calculate total cart value
    const cartValues = await prisma.cartItem.findMany({
      include: { product: true },
    });

    const totalCartValue = cartValues.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    res.json({
      overview: {
        totalProducts,
        totalUsers,
        totalCarts,
        totalCartItems,
        totalCartValue,
        averageCartValue: totalCarts > 0 ? totalCartValue / totalCarts : 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for AI chatbot notifications
app.post('/api/webhook/ai-notification', (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log(`AI Webhook received: ${event}`, data);
    
    // Here you can implement logic to handle different AI events
    // For example: product recommendations, cart abandonment alerts, etc.
    
    res.json({ 
      status: 'received',
      event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Monitoring server running on port ${port}`);
  console.log(`Metrics available at http://localhost:${port}/metrics`);
  console.log(`Health check at http://localhost:${port}/health`);
  console.log(`API endpoints at http://localhost:${port}/api/*`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});