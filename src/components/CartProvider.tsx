'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  CartItem,
  CartLine,
  NailSet,
  PreferredLength,
} from '@/types';

const CART_STORAGE_KEY =
  'billi-boba-cart-v1';

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  isReady: boolean;

  addItem: (
    set: NailSet,
    length: PreferredLength,
  ) => void;

  updateQuantity: (
    cartId: string,
    quantity: number,
  ) => void;

  removeItem: (
    cartId: string,
  ) => void;

  clearCart: () => void;
};

const CartContext =
  createContext<CartContextValue | null>(
    null,
  );

function makeCartId(
  setId: string,
  length: PreferredLength,
) {
  return `${setId}__${length
    .toLowerCase()
    .replace(/\s+/g, '-')}`;
}

function parseStoredCart(
  value: string | null,
): CartItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        value,
      ) as CartItem[];

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    return parsed.filter(
      (item) =>
        typeof item.cartId ===
          'string' &&
        typeof item.setId ===
          'string' &&
        typeof item.length ===
          'string' &&
        typeof item.quantity ===
          'number' &&
        item.quantity > 0 &&
        Boolean(
          item.setSnapshot,
        ),
    );
  } catch {
    return [];
  }
}

export default function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [
    isReady,
    setIsReady,
  ] = useState(false);

  useEffect(() => {
    if (
      typeof window ===
      'undefined'
    ) {
      return;
    }

    const timeoutId =
      window.setTimeout(() => {
        const savedCart =
          window.localStorage.getItem(
            CART_STORAGE_KEY,
          );

        setItems(
          parseStoredCart(
            savedCart,
          ),
        );

        setIsReady(true);
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [items, isReady]);

  const lines =
    useMemo(() => {
      return items
        .map((item) => {
          const set =
            item.setSnapshot;

          if (!set) {
            return null;
          }

          return {
            ...item,
            set,
          };
        })
        .filter(
          Boolean,
        ) as CartLine[];
    }, [items]);

  const count =
    useMemo(
      () =>
        items.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantity,
          0,
        ),
      [items],
    );

  const subtotal =
    useMemo(
      () =>
        lines.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.set.price *
              item.quantity,
          0,
        ),
      [lines],
    );

  const addItem =
    useCallback(
      (
        set: NailSet,
        length: PreferredLength,
      ) => {
        const cartId =
          makeCartId(
            set.id,
            length,
          );

        setItems(
          (
            currentItems,
          ) => {
            const existingItem =
              currentItems.find(
                (item) =>
                  item.cartId ===
                  cartId,
              );

            if (
              existingItem
            ) {
              return currentItems.map(
                (item) =>
                  item.cartId ===
                  cartId
                    ? {
                        ...item,

                        quantity:
                          item.quantity +
                          1,

                        setSnapshot:
                          set,
                      }
                    : item,
              );
            }

            return [
              ...currentItems,
              {
                cartId,

                setId:
                  set.id,

                length,

                quantity: 1,

                addedAt:
                  new Date().toISOString(),

                setSnapshot:
                  set,
              },
            ];
          },
        );
      },
      [],
    );

  const updateQuantity =
    useCallback(
      (
        cartId: string,
        quantity: number,
      ) => {
        const nextQuantity =
          Math.max(
            1,
            Math.min(
              9,
              Math.round(
                quantity,
              ),
            ),
          );

        setItems(
          (
            currentItems,
          ) =>
            currentItems.map(
              (item) =>
                item.cartId ===
                cartId
                  ? {
                      ...item,
                      quantity:
                        nextQuantity,
                    }
                  : item,
            ),
        );
      },
      [],
    );

  const removeItem =
    useCallback(
      (cartId: string) => {
        setItems(
          (
            currentItems,
          ) =>
            currentItems.filter(
              (item) =>
                item.cartId !==
                cartId,
            ),
        );
      },
      [],
    );

  const clearCart =
    useCallback(() => {
      setItems([]);
    }, []);

  const value =
    useMemo(
      () => ({
        items,
        lines,
        count,
        subtotal,
        isReady,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }),
      [
        items,
        lines,
        count,
        subtotal,
        isReady,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      ],
    );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(
      CartContext,
    );

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider',
    );
  }

  return context;
}