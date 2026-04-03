
import { IOrder } from "../models/order.model"; 

export const formatOrderMessage = (
  order: IOrder,
  tracking_code?: string,
  consignment_id?: string,
): string => {
  const itemLines = order.items
    .map((item, i) => {
      const variant = item.variant
        ? `  └ <i>${item.variant.size} / ${item.variant.color}</i>`
        : item.attarSize
          ? `  └ <i>${item.attarSize.ml}ml</i>`
          : "";

      return `  ${i + 1}. <b>${item.name}</b> × ${item.quantity} — <code>${item.price} ৳</code>\n${variant}`;
    })
    .join("\n");

  return `
🛍️ <b>New Order Received!</b>

👤 <b>Customer</b>
  Name: <b>${order.fullName}</b>
  Phone: <code>${order.phone}</code>${order.altPhone ? `\n  Alt: <code>${order.altPhone}</code>` : ""}

📍 <b>Address</b>
  ${order.address}, ${order.city}, ${order.district}

🧾 <b>Items</b>
${itemLines}

💰 <b>Payment</b>
  Subtotal: <code>${order.subtotal} ৳</code>
  Delivery: <code>${order.deliveryCharge} ৳</code>
  <b>Grand Total: <code>${order.grandTotal} ৳</code></b>
  Method: <b>${order.paymentMethod}</b>

🚚 <b>Delivery</b>
  Tracking: <code>${tracking_code ?? "N/A"}</code>
  Consignment: <code>${consignment_id ?? "N/A"}</code>
  Status: <b>${order.deliveryStatus ?? "Pending"}</b>
${order.note ? `\n📝 <b>Note:</b> ${order.note}` : ""}
`.trim();
};