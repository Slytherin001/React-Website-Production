import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routing
//REGISTER || METHOD POST

router.post("/register", registerController);

//LOGIN || METHOD POST
router.post("/login", loginController);

//Forgot Password
router.post("/forgot-password", forgotPasswordController);

//Test Route
router.get("/test", requireSignIn, isAdmin, testController);

//protected route user
router.get("/user-auth", requireSignIn, (req, resp) => {
  resp.status(200).send({ ok: true });
});

//protected route admin
router.get("/admin-auth", requireSignIn, isAdmin, (req, resp) => {
  resp.status(200).send({ ok: true });
});

//Profile Update
router.put("/profile", requireSignIn, updateProfileController);

//orders
router.get("/orders", requireSignIn, getOrdersController);

//Admin Orders
router.get("/all-orders", requireSignIn, getAllOrdersController);

//Order Update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
