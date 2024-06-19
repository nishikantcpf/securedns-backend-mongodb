const express = require("express");
const { createUser, loginUserCtrl, getallUser, getaUser, deleteaUser, handleRefreshToken, logout,  updatePassword, protectedctrl, wireguardCtrl } = require("../controller/userctrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const { createPayee, getPayee, successfullPayment, totalAmount, getsinglePayee } = require("../controller/payeectrl");
const authenticateToken = require("../middlewares/authenticateToken");
const { vpnStateCtrl, userdetailCtrl } = require("../controller/logctrl");
const { wireguardCtrl1 } = require("../controller/wirguardcrtl");

const router = express.Router();



router.get("/all-users", getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/:id", getaUser);
router.delete("/:id", deleteaUser);
router.get("/refresh", handleRefreshToken);
router.put('/update-password', updatePassword);


router.post("/signup", createUser);
router.post("/login", loginUserCtrl);
router.get("/protected-route", authenticateToken , protectedctrl)
router.post("/wireguardapi", wireguardCtrl);
router.post("/wireguardapi1", wireguardCtrl1);

// log router
router.post("/vpnstat", vpnStateCtrl);
// router.post("/contact", contactCtrl);
router.post("/userdetail", userdetailCtrl);

module.exports = router;