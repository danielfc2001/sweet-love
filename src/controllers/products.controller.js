import fs from "fs/promises";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const dataPath = path.resolve("src/data/products.json");
const imagesDir = path.resolve("src/data/images");

// GET all products
export const getProducts = async (req, res) => {
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
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

// GET single product
export const getProduct = async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving product" });
  }
};

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const { name, description, price, category, newCategory } = req.body;
    //let imagePath = null;
    /* if (req.file) {
      imagePath = `data/images/${req.file.filename}`;
    } */
    console.log(req.body);
    const newProduct = {
      id: uuidv4(),
      name,
      description,
      price: parseFloat(price),
      category: newCategory ? newCategory : category,
      // imagePath,
    };
    console.log(newProduct);
    products.push(newProduct);
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
    res
      .status(201)
      .json({ newProduct, message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1)
      return res.status(404).json({ message: "Product not found" });
    const { name, description, price, category } = req.body;
    /*       let imagePath = products[idx].imagePath;
      if (req.file) {
        imagePath = `data/images/${req.file.filename}`;
      } */
    products[idx] = {
      ...products[idx],
      name: name ?? products[idx].name,
      description: description ?? products[idx].description,
      price: price ? parseFloat(price) : products[idx].price,
      category: category ?? products[idx].category,
      //imagePath,
    };
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
    res.status(200).json(products[idx]);
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1)
      return res.status(404).json({ message: "Product not found" });
    // Optionally delete image file
    if (products[idx].imagePath) {
      try {
        await fs.unlink(path.resolve("src", products[idx].imagePath));
      } catch {}
    }
    products.splice(idx, 1);
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
};

// Multer config for image upload
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, uuidv4() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});
