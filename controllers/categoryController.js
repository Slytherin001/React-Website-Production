import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const createCategoryController = async (req, resp) => {
  try {
    const { name } = req.body;

    if (!name) {
      return resp.status(401).send({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await categoryModel.findOne({ name });

    if (existingCategory) {
      return resp
        .status(200)
        .send({ success: false, message: "Category already exists" });
    }

    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();

    resp.status(201).send({
      success: true,
      message: "New Category created successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      error,
      message: "something went wrong",
    });
  }
};

export const updateCategoryController = async (req, resp) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const existingCategory = await categoryModel.findOne({ name });

    if (existingCategory) {
      return resp.status(200).send({
        success: false,
        message: "category already exists",
      });
    }

    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );

    resp.status(200).send({
      success: true,
      message: "category updated successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      error,
      message: "Something went wrong",
    });
  }
};

export const categoriesController = async (req, resp) => {
  try {
    const category = await categoryModel.find({});
    resp.status(200).send({ success: true, message: "All category", category });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const singleCategoryController = async (req, resp) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    resp.status(200).send({
      success: true,
      message: "Getting single category details",
      category,
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

export const deleteCategoryController = async (req, resp) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    resp.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
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
