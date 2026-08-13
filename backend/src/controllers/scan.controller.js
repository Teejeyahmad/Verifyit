const { Jimp } = require("jimp");
const jsQR = require("jsqr");
const { ProductModel, ScanModel } = require("../models");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Cache the import — dynamic import needed because zxing-wasm is ESM only
let _zxing = null;
const getZxing = async () => {
  if (!_zxing) _zxing = await import("zxing-wasm");
  return _zxing;
};

// ── Try to decode QR from image data with multiple preprocessing passes ──
const decodeQRFromBuffer = async (imageBuffer) => {
  const { readBarcodesFromImageData } = await getZxing();

  const zxingHints = {
    formats: ["QRCode"],
    tryHarder: true, // exhaustive search — slower but finds more codes
    tryRotate: true, // try all 4 rotations
    tryInvert: true, // try dark-on-light and light-on-dark
  };

  // ── Multiple preprocessing passes ───────────────────────────────────
  // Each pass applies different enhancement. We stop at the first success.
  const passes = [
    // Pass 1 — light touch: greyscale + mild contrast
    async (img) => img.clone().greyscale().contrast(0.3),

    // Pass 2 — stronger contrast
    async (img) => img.clone().greyscale().contrast(0.6).normalize(),

    // Pass 3 — high contrast + sharpen
    async (img) =>
      img
        .clone()
        .greyscale()
        .contrast(0.8)
        .normalize()
        .convolute([
          [-1, -1, -1],
          [-1, 9, -1],
          [-1, -1, -1],
        ]),

    // Pass 4 — upscale 2x then decode (helps with tiny QR codes)
    async (img) => img.clone().scale(2).greyscale().contrast(0.5).normalize(),

    // Pass 5 — brighten (helps underexposed images)
    async (img) => img.clone().greyscale().brightness(0.3).contrast(0.5),

    // Pass 6 — darken (helps overexposed/washed-out images)
    async (img) => img.clone().greyscale().brightness(-0.2).contrast(0.7),
  ];

  const sourceImage = await Jimp.read(imageBuffer);

  for (let i = 0; i < passes.length; i++) {
    try {
      const processed = await passes[i](sourceImage);
      const { data, width, height } = processed.bitmap;

      // zxing-wasm needs RGBA Uint8ClampedArray
      const result = await readBarcodesFromImageData(
        { data: new Uint8ClampedArray(data), width, height },
        zxingHints,
      );

      if (result && result.length > 0 && result[0].text) {
        console.log(`QR decoded on pass ${i + 1}: ${result[0].text}`);
        return result[0].text;
      }
    } catch (err) {
      console.log(`Pass ${i + 1} failed:`, err.message);
    }
  }

  return null; // all passes failed
};

const decodeAndVerify = async (req, res) => {
  try {
    // req.body is the raw JPEG buffer sent by the ESP32
    const imageBuffer = req.body;
    console.log("done 1");
    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        verified: false,
        message: "No image received",
      });
    }

    // ── Step 1: Read image with Jimp ──────────────────────────────
    let image;
    try {
      image = await Jimp.read(imageBuffer);
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        verified: false,
        message: "Could not read image",
      });
    }
    // const desktopPath = path.join(os.homedir(), "Desktop");
    // let filename = `img_${Date.now()}.jpg`;
    // let filepath = path.join(desktopPath, filename);
    // await image.write(filepath);

    // // ── Step 2: Enhance image for better QR detection ─────────────
    // image
    //   .greyscale() // QR codes are black and white
    //   .contrast(0.3) // increase contrast
    //   .normalize(); // normalize brightness levels
    // console.log("done 2");
    // filename = `image_v2.jpg`;
    // filepath = path.joinf(desktopPath, filename);
    // await image.write(filepath);
    // const { data, width, height } = image.bitmap;

    // ── Step 3: Decode QR code ────────────────────────────────────
    // const qrResult = jsQR(data, width, height, {
    //   inversionAttempts: "dontInvert", // tries normal and inverted
    // });

    // if (!qrResult) {
    //   return res.status(400).json({
    //     verified: false,
    //     message: "No QR code found. Hold steady and try again.",
    //   });
    // }

    // const qrContent = qrResult.data.trim();
    // console.log("QR decoded:", qrContent);

    //-------- EXTRA STUFF (TEST)-----------------------------------------------------------------------------

    const qrResult = await decodeQRFromBuffer(imageBuffer);

    if (!qrResult) {
      return res.status(400).json({
        verified: false,
        message: "No QR code found. Hold steady and ensure good lighting.",
      });
    }

    console.log("QR content:", qrResult);

    qrContent = qrResult.trim();
    // ── Step 4: Extract short code from whatever the QR contains ──
    // Handles: https://verifyit.vercel.app/v/4XK9MZ-C
    // Or bare: 4XK9MZ
    //let shortCode = qrContent;
    // const lastSlash = qrContent.lastIndexOf("/");
    // if (lastSlash >= 0) {
    //   shortCode = qrContent.substring(lastSlash + 1);
    // }

    // // Check if it's a carton scan
    // const isCarton = shortCode.endsWith("-C");
    // if (isCarton) shortCode = shortCode.slice(0, -2);

    let productId = qrContent.split("/").at(-1);
    // ── Step 5: Look up product ───────────────────────────────────
    console.log(productId);
    const product = await ProductModel.findOne({ _id: productId }).populate(
      "business",
      "name cacNumber nafdacNumber",
    );

    if (!product) {
      return res.status(404).json({
        verified: false,
        message: "Product not found. This QR may be counterfeit.",
      });
    }

    // ── Step 6: Record the scan ───────────────────────────────────
    const isFirstScan = product.scanCount === 0;

    await ScanModel.create({
      product: product._id,
      //qrType: isCarton ? "carton" : "unit",
      userAgent: "VerifyIt-Scanner-Device",
    });

    product.scanCount += 1;
    if (isFirstScan) product.firstScannedAt = new Date();
    await product.save();

    // ── Step 7: Return product info ───────────────────────────────
    return res.json({
      verified: true,
      isFirstScan,
      //isCarton,
      product: {
        name: product.name,
        batch: product.batch || "",
        expiryDate: product.expiryDate || null,
        nafdacNumber: product.nafdacNumber || "",
        registeredBy: product.business.name,
        cacNumber: product.business.cacNumber || "",
        scanCount: product.scanCount,
      },
    });
  } catch (error) {
    console.error("Scan error:", error);
    return res.status(500).json({
      verified: false,
      message: "Server error. Try again.",
    });
  }
};

module.exports = { decodeAndVerify };
