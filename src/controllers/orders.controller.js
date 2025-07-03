import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const dataPath = path.resolve("src/data/cake-order.json");

export const getCakeOrders = async (req, res) => {
  try {
    const orders = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    if (!orders) throw { errorStatus: 500, message: "No orders found" };
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(error.errorStatus || 500)
      .json({ message: error.message || "Error fetching cake orders" });
  }
};

export const sendCakeOrder = async (req, res) => {
  const data = req.body;
  console.log(data);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: `"Customer email" <${data.email}>`,
      to: process.env.ORDERS_EMAIL,
      subject: "New Cake Order",
      text:
        `New cake order from ${data.name} (${data.email})\n\n` +
        `Phone numer: ${data.phone}\n` +
        `First Order: ${data.firstOrder}\n` +
        `Cake Shape: ${data["Cake Shape"]}\n` +
        `Cake Flavor: ${
          data["Cake Flavour"] === "Other"
            ? data["Cake Flavour_other"]
            : data["Cake Flavour"]
        }\n` +
        `Cake Size: ${data["Cake Size"]}\n` +
        `Cake Decoration: ${
          data["Decoration"] === "Other"
            ? data["Decoration_other"]
            : data["Decoration"]
        }\n` +
        `Cake Filling: ${
          data["Filling"] === "Other" ? data["Filling_other"] : data["Filling"]
        }\n` +
        `Cake Icing: ${
          data["Icing"] === "Other" ? data["Icing_other"] : data["Icing"]
        }\n` +
        `Inside the cake: ${
          data["Inside the Cake"] === "Other"
            ? data["Inside the Cake_other"]
            : data["Inside the Cake"]
        }\n` +
        `Special Instructions: ${data.instructions}\n\n` +
        `Delivery Date: ${data.eventDate}`,
    };
    const response = await transporter.sendMail(mailOptions);
    if (!response) {
      throw { errorStatus: 500, message: "Error sending the order email." };
    }
    res.status(200).json({ message: "Order sended successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(error.errorStatus || 500)
      .json({ message: error.message || "Error procesing the order." });
  }
};

export const createCakeItem = async (req, res) => {
  const { name, category, newCategory } = req.body;
  const orders = JSON.parse(await fs.readFile(dataPath, "utf-8"));
  try {
    if (newCategory) {
      const result = [...orders, { category: newCategory, options: [name] }];
      await fs.writeFile(dataPath, JSON.stringify(result, null, 2));
    } else {
      const result = orders.map((item) => {
        if (item.category === category) {
          return {
            category: item.category,
            options: [...item.options, name],
          };
        } else {
          return { category: item.category, options: item.options };
        }
      });
      await fs.writeFile(dataPath, JSON.stringify(result, null, 2));
    }
    res.status(200).json({ message: "Item created successfully." });
  } catch (error) {
    console.log(error);
    res.status(error.errorStatus || 500).json({
      message: error.message || "An error was ocurred creating the item.",
    });
  }
};

export const deleteCakeOrder = async (req, res) => {
  const { category, item: itemName } = req.body;
  console.log(category, itemName);
  try {
    const orders = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const match = orders.map((item) => {
      const result = item.options.filter((op) => {
        if (op !== itemName) return op;
      });
      return {
        category: item.category,
        options: item.category === category ? result : item.options,
      };
    });
    console.log(match);
    await fs.writeFile(dataPath, JSON.stringify(match, null, 2));
    res.status(204).end();
  } catch (error) {
    console.log(error);
    res
      .status(error.errorStatus || 500)
      .json({ message: error.message || "Error deleting the item." });
  }
};
