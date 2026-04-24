const { ProductModel } = require("../models");
const QRCode = require("qrcode");
//const { calculateTrustScore } = require("../services/trustScore.service");

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      batch,
      expiryDate,
      nafdacNumber,
      ndleaNumber,
    } = req.body;

    const images = req.files ? req.files.map((f) => f.path) : [];

    const product = await ProductModel.create({
      name,
      description,
      category,
      batch,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      nafdacNumber,
      ndleaNumber,
      images,
      business: req.businessId,
    });

    const baseUrl = process.env.BASE_URL;
    const unitQrCode = await QRCode.toDataURL(
      `${baseUrl}/verify/${product._id}`,
    );
    const cartonQrCode = await QRCode.toDataURL(
      `${baseUrl}/verify/${product._id}/carton`,
    );

    product.unitQrCode = unitQrCode;
    product.cartonQrCode = cartonQrCode;
    await product.save();

    //await calculateTrustScore(req.businessId);

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.log("FROM ADDPRODUCT: ", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({ business: req.businessId }).sort(
      {
        createdAt: -1,
      },
    );
    if (!products.length)
      return res
        .status(200)
        .json({ message: "You don't have any product yet!" });

    res.json({ products });
  } catch (error) {
    console.log("FROM GETPRODUCTSSS: ", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await ProductModel.findOne({
      _id: req.params.id,
      business: req.businessId,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (error) {
    console.log("FORM GETPRODUCT: ", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await ProductModel.findOne({
      _id: req.params.id,
      business: req.businessId,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const newImages = req.files ? req.files.map((f) => f.path) : [];

    const {
      name,
      description,
      category,
      batch,
      expiryDate,
      nafdacNumber,
      ndleaNumber,
    } = req.body;
    const updates = {
      name,
      description,
      category,
      batch,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      nafdacNumber,
      ndleaNumber,
      images: [...product.images, ...newImages],
    };
    const allowedUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([Key, value]) => value !== "" && value !== undefined && value != null,
      ),
    );

    const updated = await ProductModel.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { returnDocument: "after" },
    );

    res.json({ message: "Product updated", product: updated });
  } catch (error) {
    console.log("FROM UPDATEPRODUCT: ", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findOne({
      _id: req.params.id,
      business: req.businessId,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.log("FROM DELETEPRODUCT", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
