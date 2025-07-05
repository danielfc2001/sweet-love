import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

const dataPath = path.resolve("src/data/buffet-order.json");

// GET all buffet products
export const getBuffetProducts = async (req, res) => {
  try {
    const productsRaw = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    // Agrupar productos por categoría
    const grouped = {};
    for (const product of productsRaw) {
      if (!grouped[product.category]) grouped[product.category] = [];
      grouped[product.category].push(product);
    }
    // Convertir a arreglo de objetos { category, products }
    const products = Object.entries(grouped).map(([category, products]) => ({
      category,
      products,
    }));
    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving buffet products" });
  }
};

// GET single buffet product
export const getBuffetProduct = async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const product = products.find((p) => p.id === req.params.id);
    if (!product)
      return res.status(404).json({ message: "Buffet product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving buffet product" });
  }
};

export const sendBuffetOrder = async (req, res) => {
  try {
    console.log(req.body);
    const { client, buffet } = req.body;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    let buffetHtml = "<ul style='padding-left:16px'>";
    for (const item of buffet) {
      for (const [key, value] of Object.entries(item)) {
        buffetHtml += `<li><strong style="color:#d2691e">${key.toUpperCase()}</strong>: <span style="color:#333">${value}</span></li>`;
      }
    }
    buffetHtml += "</ul>";
    const mailOptions = {
      from: `"Customer email" <${client.email}>`,
      to: process.env.ORDERS_EMAIL,
      subject: "New Buffet Order",
      html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border-radius:8px;background:#faf7f2">
                <h2 style="color:#d2691e">Nuevo pedido de buffet</h2>
                <p><strong>Nombre:</strong> ${client.name}</p>
                <p><strong>Email:</strong> ${client.email}</p>
                <p><strong>Teléfono:</strong> ${client.phone}</p>
                <p><strong>Primera vez:</strong> ${client.firstOrder}</p>
                <p><strong>Fecha de entrega:</strong> ${client.eventDate}</p>
                <h3 style="color:#d2691e">Selección de buffet:</h3>
                ${buffetHtml}
              </div>
            `,
    };
    const response = await transporter.sendMail(mailOptions);
    if (!response) {
      throw { errorStatus: 500, message: "Error sending the order email." };
    }
    res.status(200).json({ message: "Order sended successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error was ocurred sending the order." });
  }
};

// CREATE buffet product
export const createBuffetProduct = async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const { name, description, price, category, newCategory } = req.body;
    const newProduct = {
      id: uuidv4(),
      name,
      description,
      price: parseFloat(price),
      category: newCategory ? newCategory : category,
    };
    products.push(newProduct);
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating buffet product" });
  }
};

// UPDATE buffet product
export const updateBuffetProduct = async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1)
      return res.status(404).json({ message: "Buffet product not found" });
    const { name, description, price, category } = req.body;
    products[idx] = {
      ...products[idx],
      name: name ?? products[idx].name,
      description: description ?? products[idx].description,
      price: price ? parseFloat(price) : products[idx].price,
      category: category ?? products[idx].category,
    };
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
    res.status(200).json(products[idx]);
  } catch (error) {
    res.status(500).json({ message: "Error updating buffet product" });
  }
};

// DELETE buffet product
export const deleteBuffetProduct = async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1)
      return res.status(404).json({ message: "Buffet product not found" });
    products.splice(idx, 1);
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Error deleting buffet product" });
  }
};
