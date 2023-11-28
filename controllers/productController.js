import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from "fs";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//payment gateway
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, resp) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //Validation

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      (!photo && photo.size > 1000000)
    ) {
      return resp.status(200).send({
        success: false,
        message: "Please fill all the feild",
      });
    }

    switch (true) {
      case !name:
        return resp
          .status(200)
          .send({ success: false, message: "name is required" });
      case !description:
        return resp
          .status(200)
          .send({ success: false, message: "description is required" });
      case !price:
        return resp
          .status(200)
          .send({ success: false, message: "price is required" });
      case !category:
        return resp
          .status(200)
          .send({ success: false, message: "category is required" });
      case !quantity:
        return resp
          .status(200)
          .send({ success: false, message: "quantity is required" });
      case photo && photo.size > 1000000:
        return resp.status(200).send({
          success: false,
          message: "photo is required and should be less than 1 mb",
        });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();

    resp.status(201).send({
      success: true,
      message: "Product created successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    resp
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  }
};

export const getProductController = async (req, resp) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    resp.status(200).send({
      success: true,
      total_count: products.length,
      message: "Getting all Data",
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const getSingleProductController = async (req, resp) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    resp
      .status(200)
      .send({ success: true, message: "Single Product Fetched", product });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const productPhotoController = async (req, resp) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");

    if (product?.photo?.data) {
      resp.set("Content-Type", product.photo.contentType);
      resp.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const deleteProductController = async (req, resp) => {
  try {
    await productModel.findByIdAndDelete(req.params.id).select("-photo");
    resp.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const updateProductController = async (req, resp) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //Validation

    switch (true) {
      case !name:
        return resp
          .status(500)
          .send({ success: false, message: "name is required" });
      case !description:
        return resp
          .status(500)
          .send({ success: false, message: "description is required" });
      case !price:
        return resp
          .status(500)
          .send({ success: false, message: "price is required" });
      case !category:
        return resp
          .status(500)
          .send({ success: false, message: "category is required" });
      case !quantity:
        return resp
          .status(500)
          .send({ success: false, message: "quantity is required" });
      case photo && photo.size > 1000000:
        return resp.status(500).send({
          success: false,
          message: "photo is required and should be less than 1 mb",
        });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();

    resp.status(201).send({
      success: true,
      message: "Product Updated successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    resp
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  }
};

//Filter Method
export const productFiltersController = async (req, resp) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await productModel.find(args);
    resp.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const productCountController = async (req, resp) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    resp.status(200).send({ success: true, total });
  } catch (error) {
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const productListController = async (req, resp) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;

    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    resp.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const searchProductController = async (req, resp) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    resp.json(results);
  } catch (error) {
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const relatedProductController = async (req, resp) => {
  try {
    const { pid, cid } = req.params;

    const products = await productModel
      .find({
        category: cid,
        _id: {
          $ne: pid,
        },
      })
      .select("-photo")
      .limit(4)
      .populate("category");

    resp.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const productCategoryController = async (req, resp) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const product = await productModel.find({ category }).populate("category");

    resp.status(200).send({
      success: true,
      category,
      product,
    });
  } catch (error) {
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//Payment
//token
export const braintreeTokenController = async (req, resp) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        resp
          .status(500)
          .send({ success: false, message: "something went wrong" });
      } else {
        resp.send(response);
      }
    });
  } catch (error) {
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

//payments
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
