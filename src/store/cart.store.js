import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CART_STORAGE_KEY = 'mebsystore_cart';

export const useCartStore = create()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (item) => {
        set((state) => {
          const existing = state.cartItems.find(
            (i) => i.variantId === item.variantId,
          );

          if (existing) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }

          return {
            cartItems: [
              ...state.cartItems,
              {
                variantId: item.variantId,
                productId: item.productId,
                productName: item.productName,
                attributes: item.attributes ?? [],
                price: item.price,
                imageUrl: item.imageUrl ?? null,
                quantity: 1,
              },
            ],
          };
        });
      },

      removeFromCart: (variantId) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.variantId !== variantId,
          ),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(variantId);
          return;
        }

        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item,
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
