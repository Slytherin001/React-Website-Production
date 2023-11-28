import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import jwt from "jsonwebtoken";

//REGISTER CONTROLLER
export const registerController = async (req, resp) => {
  try {
    const { name, email, password, phone, address, answer, role } = req.body;
    //Validation
    if (!name) {
      return resp.json({ success: false, message: "Name is Required" });
    }
    if (!email) {
      return resp.json({ success: false, message: "Email is Required" });
    }
    if (!password) {
      return resp.json({ success: false, message: "Password is Required" });
    }
    if (!phone) {
      return resp.json({ success: false, message: "Phone is Required" });
    }
    if (!address) {
      return resp.json({ success: false, message: "Address is Required" });
    }
    if (!answer) {
      return resp.json({ success: false, message: "Answer is Required" });
    }
    if (!role) {
      return resp.json({ success: false, message: "Role is required" });
    }

    //existing user
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return resp.status(200).json({
        success: false,
        message: "Already registered please login",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
      role,
    }).save();

    resp.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};

//LOGIN
export const loginController = async (req, resp) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return resp.status(200).send({
        success: false,
        message: "Invalid credentials please try again",
      });
    }

    //Check User
    const user = await userModel.findOne({ email });
    if (!user) {
      return resp
        .status(200)
        .send({ success: false, message: "Email is not registered" });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return resp.status(200).send({
        success: false,
        message: "Invalid Credentials please try again",
      });
    }
    //Token
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    resp.status(200).send({
      success: true,
      message: "User login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).resp({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

//Forgot password
export const forgotPasswordController = async (req, resp) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      resp.status(404).json({ success: false, message: "Email is required" });
    }
    if (!answer) {
      resp.status(404).json({ success: false, message: "Answer is required" });
    }
    if (!newPassword) {
      resp
        .status(404)
        .json({ success: false, message: "New Password is required" });
    }

    //check
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return resp
        .status(200)
        .json({ success: false, message: "Wrong email or Answer" });
    }

    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    resp
      .status(200)
      .json({ success: true, message: "Password Reset Successfully" });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const testController = (req, resp) => {
  resp.send({ success: true, message: "Protected Route" });
};

export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getOrdersController = async (req, resp) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    resp.json(orders);
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};

export const getAllOrdersController = async (req, resp) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    resp.json(orders);
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};

export const orderStatusController = async (req, resp) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      {
        status,
      },
      { new: true }
    );

    resp.status(200).send({
      success: true,
      orders,
    });
  } catch (error) {
    resp.status(500).send({
      success: false,
      message: "Error while updating order",
    });
  }
};
