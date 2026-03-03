import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CART_STORAGE_KEY = 'mebsystore_cart';

export const useCartStore = create()(
  persist(
    (set, get) => ({
      cartItems: [],
      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.productId === product.id,
          );

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            cartItems: [
              ...state.cartItems,
              {
                productId: product.id,
                productName: product.name,
                price: product.price,
                imageUrl: product.imageUrl || null,
                quantity: 1,
              },
            ],
          };
        });
      },
      removeFromCart: (productId) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.productId !== productId,
          ),
        }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            cartItems: state.cartItems.filter(
              (item) => item.productId !== productId,
            ),
          }));
          return;
        }

        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        }));
      },
      clearCart: () => {
        set({ cartItems: [] });
      },
      getTotalItems: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const { cartItems } = get();
        return cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: CART_STORAGE_KEY,
    },
  ),
);

