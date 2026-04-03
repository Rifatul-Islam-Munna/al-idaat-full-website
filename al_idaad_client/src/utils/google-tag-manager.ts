import { sendGTMEvent } from "@next/third-parties/google";
import { type UserType } from "./types";

type Product = {
  _id: string;
  slug?: string;
  name: string;
  brandName?: string;
  category?: string;
  subMain?: string;
  offerPrice?: number;
  price: number;
};

export type GtmItemSelection = {
  size?: string;
  color?: string;
};

export interface GtmCartItem {
  productId: string;
  slug?: string;
  name: string;
  brandName?: string;
  category?: string;
  subMain?: string;
  unitPrice: number;
  quantity: number;
  variant?: GtmItemSelection;
}

type Extra = {
  event_id: string;
  userId?: string;
  userName?: string;
  email?: string;
};

export type GtmUser = Pick<UserType, "_id" | "name" | "email"> | null | undefined;

export const createGtmEventId = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `gtm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getGtmUserMeta = (user: GtmUser): Omit<Extra, "event_id"> => ({
  userId: user?._id,
  userName: user?.name,
  email: user?.email,
});

const getItemVariant = (variant?: GtmItemSelection) => {
  const size = variant?.size?.trim();
  const color = variant?.color?.trim();

  if (size && color) {
    return `${size} / ${color}`;
  }

  return size || color || undefined;
};

const mapCartItemToGtmItem = (item: GtmCartItem) => {
  const itemVariant = getItemVariant(item.variant);

  return {
    item_id: item.slug ?? item.productId,
    item_name: item.name,
    item_brand: item.brandName,
    item_category: item.category,
    item_category2: item.subMain,
    ...(itemVariant ? { item_variant: itemVariant } : {}),
    price: item.unitPrice,
    quantity: item.quantity,
  };
};

export const viewcontentEvent = (payload: Product & Extra) => {
  const price = payload.offerPrice ?? payload.price;

  return sendGTMEvent({
    event: "view_item",
    event_id: payload.event_id,
    user_data: {
      user_id: payload.userId,
      name: payload.userName,
      email: payload.email,
    },
    ecommerce: {
      currency: "BDT",
      value: price,
      items: [
        {
          item_id: payload.slug ?? payload._id,
          item_name: payload.name,
          item_brand: payload.brandName,
          item_category: payload.category,
          item_category2: payload.subMain,
          price,
          quantity: 1,
        },
      ],
    },
  });
};

export const addToCartEvent = (payload: GtmCartItem & Extra) => {
  return sendGTMEvent({
    event: "add_to_cart",
    event_id: payload.event_id,
    user_data: {
      user_id: payload.userId,
      name: payload.userName,
      email: payload.email,
    },
    ecommerce: {
      currency: "BDT",
      value: payload.unitPrice * payload.quantity,
      items: [mapCartItemToGtmItem(payload)],
    },
  });
};

export interface BeginCheckoutPayload extends Extra {
  items: GtmCartItem[];
}

export const initiateCheckoutEvent = (payload: BeginCheckoutPayload) => {
  return sendGTMEvent({
    event: "begin_checkout",
    event_id: payload.event_id,
    user_data: {
      user_id: payload.userId,
      name: payload.userName,
      email: payload.email,
    },
    ecommerce: {
      currency: "BDT",
      value: payload.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      items: payload.items.map(mapCartItemToGtmItem),
    },
  });
};

export interface PurchaseProduct extends GtmCartItem {
  totalPrice: number;
  discountApplied?: number;
  sku?: string;
}

export interface PurchaseEventPayload extends Extra {
  orderId: string;
  orderTotal: number;
  totalDiscount: number;
  shipping?: number;
  products: PurchaseProduct[];
}

export const purchaseEvent = (payload: PurchaseEventPayload) => {
  return sendGTMEvent({
    event: "purchase",
    event_id: payload.event_id,
    user_data: {
      user_id: payload.userId,
      name: payload.userName,
      email: payload.email,
    },
    ecommerce: {
      transaction_id: payload.orderId,
      currency: "BDT",
      value: payload.orderTotal,
      ...(typeof payload.shipping === "number" ? { shipping: payload.shipping } : {}),
      discount: payload.totalDiscount,
      items: payload.products.map((product) => {
        const item = mapCartItemToGtmItem(product);

        return product.sku ? { ...item, item_sku: product.sku } : item;
      }),
    },
  });
};

export const pageViewEvent = (payload: {
  event_id: string;
  url: string;
  page_title: string;
}) => {
  return sendGTMEvent({
    event: "page_view",
    event_id: payload.event_id,
    page_location: payload.url,
    page_title: payload.page_title,
  });
};
