const axios = require("axios");

const sendOrderEmails = async (order) => {
  try {
    const {
      customerEmail,
      orderId,
      items,
      subtotal,
      discount,
      delivery,
      total,
    } = order;

    const itemsHtml = items.map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>₹${item.price}</td>
        </tr>
      `
    ).join("");

    const html = `
      <div style="font-family:Arial;padding:20px">
        <h2>Order Confirmed ✅</h2>
        <p>Order ID: <b>${orderId}</b></p>

        <table border="1" cellpadding="8" width="100%">
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
          ${itemsHtml}
        </table>

        <p>Subtotal: ₹${subtotal}</p>
        <p>Discount: ₹${discount || 0}</p>
        <p>Delivery: ₹${delivery}</p>
        <h3>Total: ₹${total}</h3>
      </div>
    `;

    // 👤 CUSTOMER MAIL
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: "order.bushare@gmail.com" },
        to: [{ email: customerEmail }],
        subject: "Order Confirmed",
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // 🧑‍💼 ADMIN MAIL
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: "order.bushare@gmail.com" },
        to: [{ email: "order.bushare@gmail.com" }],
        subject: "New Order Received",
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Emails sent via API");
  } catch (err) {
    console.log("❌ Email Error:", err.response?.data || err.message);
  }
};

module.exports = sendOrderEmails;