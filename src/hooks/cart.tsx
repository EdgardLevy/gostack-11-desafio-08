import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStored = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (productsStored) setProducts(JSON.parse(productsStored));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIdx = products.findIndex(item => item.id === product.id);

      product.quantity =
        productIdx === -1 ? 1 : products[productIdx].quantity + 1;

      if (productIdx === -1) {
        const productsStored = [...products, product];

        setProducts(productsStored);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(productsStored),
        );
      } else {
        const productsStored = [...products];
        productsStored[productIdx] = product;

        setProducts(productsStored);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(productsStored),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsStored = products.map(product => {
        if (product.id === id) {
          product.quantity += 1;
        }
        return product;
      });

      setProducts(productsStored);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productsStored),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsStored = products.map(product => {
        if (product.id === id) {
          if (product.quantity - 1 > 0) product.quantity -= 1;
        }
        return product;
      });

      setProducts(productsStored);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productsStored),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
