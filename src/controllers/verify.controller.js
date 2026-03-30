const { ProductModel, ScanModel } = require("../models");

const verifyProduct = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "business",
      "name email cacNumber nafdacNumber",
    );

    if (!product) {
      return res.status(404).json({
        verified: false,
        message:
          "Product not found. This QR code may be counterfeit or tampered.",
      });
    }

    const isFirstScan = product.scanCount === 0;

    await ScanModel.create({
      product: product._id,
      qrType: "unit",
      userAgent: req.headers["user-agent"],
    });
    product.prevScannedAt = new Date();
    product.scanCount += 1;
    if (isFirstScan) product.firstScannedAt = new Date();
    await product.save();

    res.json({
      verified: true,
      message: isFirstScan
        ? "Product verified successfully."
        : `This product was first scanned on ${product.firstScannedAt.toDateString()}. Ensure the seal was intact.`,
      product: {
        name: product.name,
        description: product.description,
        category: product.category,
        batch: product.batch,
        expiryDate: product.expiryDate,
        nafdacNumber: product.nafdacNumber,
        images: product.images,
        registeredBy: product.business.name,
        cacNumber: product.business.cacNumber,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ verified: false, message: "Invalid QR code" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
};

const verifyCarton = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "business",
      "name cacNumber",
    );

    if (!product) {
      return res.status(404).json({
        verified: false,
        message:
          "Carton not found. This batch may be unregistered or counterfeit.",
      });
    }

    await ScanModel.create({
      product: product._id,
      qrType: "carton",
      userAgent: req.headers["user-agent"],
    });

    res.json({
      verified: true,
      type: "carton",
      product: {
        name: product.name,
        batch: product.batch,
        expiryDate: product.expiryDate,
        registeredBy: product.business.name,
        cacNumber: product.business.cacNumber,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { verifyProduct, verifyCarton };
