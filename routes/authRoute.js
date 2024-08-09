const express = require("express");
const { createUser, loginUserCtrl, getallUser, getaUser, deleteaUser, handleRefreshToken, logout,  updatePassword, protectedctrl, wireguardCtrl, newwireguardCtrl } = require("../controller/userctrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const { createPayee, getPayee, successfullPayment, totalAmount, getsinglePayee } = require("../controller/payeectrl");
const authenticateToken = require("../middlewares/authenticateToken");
const { vpnStateCtrl, userdetailCtrl, userdetailCtrlget, deviceCtrl, bigchartCtrl, statdataCtrl,  checkDomains } = require("../controller/logctrl");
const { wireguardCtrl1 } = require("../controller/wirguardcrtl");

const router = express.Router();



router.get("/all-users", getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);

// router.get("/:id", getaUser); this have some isue do not uncomment this
router.delete("/:id", deleteaUser);
router.get("/refresh", handleRefreshToken);
router.put('/update-password', updatePassword);
router.post("/signup", createUser);
router.post("/login", loginUserCtrl);

// router.get("/protected-route", authenticateToken , protectedctrl)
router.post("/wireguardapi", newwireguardCtrl);
router.post("/wireguardapi1", wireguardCtrl1);

// log router
router.post("/vpnstat", vpnStateCtrl);
// router.post("/contact", contactCtrl);
router.post("/userdetail", userdetailCtrl);

router.get("/userdetail/:id", userdetailCtrlget);
router.get("/device/:id", deviceCtrl);
router.get("/bigchart/:id", bigchartCtrl);
router.get("/statdata/:id",statdataCtrl);
// router.get("/dns_logs",dns_logs)
// router.get("/assingip3",assingip)
// router.get("/readlog",readlog)
router.get("/checkDomains",checkDomains)


module.exports = router;