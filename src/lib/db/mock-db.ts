import { Cart, CartItem, PrismaClient, Product } from "@prisma/client";

// Sample products with images from the internet
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Leather Handbag",
    description: "Elegant leather handbag with gold accents. Perfect for any occasion.",
    price: 129900, // $1,299.00
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    name: "Designer Sunglasses",
    description: "Stylish sunglasses with UV protection. Made with premium materials.",
    price: 39900, // $399.00
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    name: "Silk Scarf",
    description: "Luxurious silk scarf with a unique pattern. Adds elegance to any outfit.",
    price: 24900, // $249.00
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    name: "Leather Wallet",
    description: "Handcrafted leather wallet with multiple card slots and a coin pocket.",
    price: 19900, // $199.00
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "5",
    name: "Designer Watch",
    description: "Elegant watch with a stainless steel case and leather strap.",
    price: 299900, // $2,999.00
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "6",
    name: "Leather Belt",
    description: "Premium leather belt with a designer buckle. Perfect for formal occasions.",
    price: 14900, // $149.00
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "7",
    name: "Designer Shoes",
    description: "Handcrafted leather shoes with a unique design. Comfortable and stylish.",
    price: 89900, // $899.00
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "8",
    name: "Silk Tie",
    description: "Luxurious silk tie with a unique pattern. Perfect for formal occasions.",
    price: 12900, // $129.00
    imageUrl: "https://images.unsplash.com/photo-1598532213005-76f745254959?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=778&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock cart data
let mockCarts: Cart[] = [];
let mockCartItems: CartItem[] = [];
let cartIdCounter = 1;
let cartItemIdCounter = 1;

// Mock PrismaClient implementation
export const mockPrisma = {
  product: {
    findMany: async ({ orderBy }: any = {}) => {
      if (orderBy && orderBy.id === "desc") {
        return [...sampleProducts].reverse();
      }
      return sampleProducts;
    },
    findUnique: async ({ where }: any) => {
      return sampleProducts.find(p => p.id === where.id) || null;
    },
    create: async ({ data }: any) => {
      const newProduct = {
        ...data,
        id: String(sampleProducts.length + 1),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      sampleProducts.push(newProduct as Product);
      return newProduct;
    }
  },
  cart: {
    findFirst: async ({ where, include }: any) => {
      const cart = mockCarts.find(c => c.userId === where?.userId);
      if (!cart) return null;
      
      if (include?.items?.include?.product) {
        const items = mockCartItems
          .filter(item => item.cartId === cart.id)
          .map(item => ({
            ...item,
            product: sampleProducts.find(p => p.id === item.productId)!
          }));
        
        return {
          ...cart,
          items
        };
      }
      
      return cart;
    },
    findUnique: async ({ where, include }: any) => {
      const cart = mockCarts.find(c => c.id === where?.id);
      if (!cart) return null;
      
      if (include?.items?.include?.product) {
        const items = mockCartItems
          .filter(item => item.cartId === cart.id)
          .map(item => ({
            ...item,
            product: sampleProducts.find(p => p.id === item.productId)!
          }));
        
        return {
          ...cart,
          items
        };
      }
      
      return cart;
    },
    create: async ({ data }: any) => {
      const newCart: Cart = {
        id: String(cartIdCounter++),
        userId: data.userId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockCarts.push(newCart);
      return newCart;
    },
    delete: async ({ where }: any) => {
      const index = mockCarts.findIndex(c => c.id === where.id);
      if (index !== -1) {
        const deletedCart = mockCarts[index];
        mockCarts.splice(index, 1);
        // Also delete cart items
        mockCartItems = mockCartItems.filter(item => item.cartId !== where.id);
        return deletedCart;
      }
      return null;
    }
  },
  cartItem: {
    create: async ({ data }: any) => {
      const newItem: CartItem = {
        id: String(cartItemIdCounter++),
        productId: data.productId,
        quantity: data.quantity,
        cartId: data.cartId
      };
      mockCartItems.push(newItem);
      return newItem;
    },
    deleteMany: async ({ where }: any) => {
      const count = mockCartItems.filter(item => item.cartId === where.cartId).length;
      mockCartItems = mockCartItems.filter(item => item.cartId !== where.cartId);
      return { count };
    },
    updateMany: async ({ where, data }: any) => {
      const itemsToUpdate = mockCartItems.filter(
        item => item.cartId === where.cartId && item.productId === where.productId
      );
      
      for (const item of itemsToUpdate) {
        Object.assign(item, data);
      }
      
      return { count: itemsToUpdate.length };
    },
    findFirst: async ({ where }: any) => {
      return mockCartItems.find(
        item => item.cartId === where.cartId && item.productId === where.productId
      ) || null;
    },
    delete: async ({ where }: any) => {
      const index = mockCartItems.findIndex(item => item.id === where.id);
      if (index !== -1) {
        const deletedItem = mockCartItems[index];
        mockCartItems.splice(index, 1);
        return deletedItem;
      }
      return null;
    },
    createMany: async ({ data }: any) => {
      const newItems = data.map((itemData: any) => {
        const newItem: CartItem = {
          id: String(cartItemIdCounter++),
          productId: itemData.productId,
          quantity: itemData.quantity,
          cartId: itemData.cartId
        };
        mockCartItems.push(newItem);
        return newItem;
      });
      
      return { count: newItems.length };
    }
  },
  $transaction: async (callback: any) => {
    return await callback(mockPrisma);
  }
} as unknown as PrismaClient;