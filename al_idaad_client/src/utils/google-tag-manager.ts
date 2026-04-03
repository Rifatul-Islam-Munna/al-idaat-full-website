import { sendGTMEvent } from "@next/third-parties/google";



interface Product {
  _id: string;
  slug?: string;
  name: string;
  brandName?: string;
  category?: string;
  subMain?: string;
  hasOffer?: boolean;
  offerPrice?: number;
  price: number;
}

interface CartItem {
  productId: string;
  slug?: string;
  name: string;
  brandName?: string;
  unitPrice: number;
  quantity: number;
  variant: {
    size: string;
    color: string;
  };
}

// ─── Shared user/event metadata ─────────────────────────────────────────────

type Extra = {
  event_id: string;
  userId: string | undefined;
  userName: string | undefined;
  email: string | undefined;
};

// ─── Events ─────────────────────────────────────────────────────────────────

export const viewcontentEvent = (payload: Product & Extra) => {
  console.log("sending-payload-for-product-view", payload);
  return sendGTMEvent({
    event: "view_item",
    event_id: payload._id,
    user_data: {
      user_id: payload?.userId,
      name: payload?.userName,
      email: payload?.email,
    },
    ecommerce: {
      currency: "BDT",
      value: payload.offerPrice ?? payload.price,
      items: [
        {
          item_id: payload.slug ?? payload._id,
          item_name: payload.name,
          item_brand: payload.brandName,
          item_category: payload.category,
          item_category2: payload.subMain,
          price: payload.hasOffer ? payload.offerPrice : payload.price,
          quantity: 1,
        },
      ],
    },
  });
};

export const addToCartEvent = (payload: CartItem & Extra) => {
  console.log("sending-payload-for-add-to-cart", payload);
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
      value: payload.unitPrice,
      items: [
        {
          item_id: payload.slug ?? payload.productId,
          item_name: payload.name,
          item_brand: payload.brandName,
          item_variant: `${payload.variant.size} / ${payload.variant.color}`,
          price: payload.unitPrice,
          quantity: payload?.quantity ?? 1,
          description: "tiger-vai-product",
          item_category: "product",
        },
      ],
    },
  });
};

export interface BeginCheckoutPayload {
  event_id: string;
  userId?: string;
  userName?: string;
  email?: string;
  items: CartItem[];
}

export const initiateCheckoutEvent = (payload: BeginCheckoutPayload) => {
  console.log("sending-payload-for-checkout", payload);
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
      value: payload.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      ),
      items: payload.items,
    },
  });
};

export const purchaseEvent = (payload: {
  event_id: string;
  orderId: string;           // ⚠️ was missing from original type but used below
  userId: string | undefined;
  userName: string | undefined;
  email: string | undefined;
  orderTotal: number;
  totalDiscount: number;
  products: Array<{
    productId: string;
    slug: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountApplied?: number;
    variant: {
      size: string;
      color: string;
      price: number;
      discountPrice?: number;
      sku?: string;
    };
  }>;
}) => {
  console.log("sending-payload-for-purchase", payload);
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
      discount: payload.totalDiscount,
      items: payload.products.map((p) => ({
        item_id: p.productId,
        item_name: p.name,
        item_brand: p.slug,
        item_variant: `${p.variant.size} / ${p.variant.color}`,
        price: p.unitPrice,
        quantity: p.quantity,
        item_category: "product",
        ...(p.variant.sku && { item_sku: p.variant.sku }),
      })),
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