const express = require("express");
const { uploadImages, deleteImages, uploadImagesname } = require("../controller/uploadcrtl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { uploadPhoto,
    // productImgResize
} = require("../middlewares/uploadImage");
const router = express.Router();

router.post(
    "/",
    // authMiddleware,
    // isAdmin,
    // uploadPhoto.array("images", 10),
    uploadPhoto.single("file"),
    // productImgResize,
    uploadImages
);

router.post(
    "/logo",
    uploadImagesname,

)

router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);

module.exports = router;