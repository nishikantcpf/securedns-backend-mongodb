const fs = require("fs");
const asyncHandler = require("express-async-handler");
const User = require('../models/usermodel');
const validateMongoDbId = require("../utils/validateMongodbId");

// const {
//     cloudinaryUploadImg,
//     cloudinaryDeleteImg,
// } = require("../utils/cloudinary");
const uploadImagesname = asyncHandler(async (req, res) => {

    // res.status(200).json("File has been uploaded");
    console.log();
    const id = req.body.id;
    validateMongoDbId(id);

    try {
        const uploadImages = await User.findByIdAndUpdate(
            id,
            {

                document: req?.body?.document
            },
            {
                new: true,
            }

        );

        res.status(200).json("File name has been updated");

    } catch (error) {
        throw new Error(error);
    }

    // try {
    //     const uploader = (path) => cloudinaryUploadImg(path, "images");
    //     const urls = [];
    //     const files = req.files;
    //     for (const file of files) {
    //         const { path } = file;
    //         const newpath = await uploader(path);
    //         console.log(newpath);
    //         urls.push(newpath);
    //         fs.unlinkSync(path);
    //     }
    //     const images = urls.map((file) => {
    //         return file;
    //     });
    //     res.json(images);
    // } catch (error) {
    //     throw new Error(error);
    // }
});
const uploadImages = asyncHandler(async (req, res) => {

    res.status(200).json("File has been uploaded");
    // console.log();
    // const id = req.body.id;
    // validateMongoDbId(id);

    // try {
    //     const uploadImages = await User.findByIdAndUpdate(
    //         id,
    //         {

    //             document: req?.body?.document
    //         },
    //         {
    //             new: true,
    //         }

    //     );

    //     res.status(200).json("File has been uploaded");

    // } catch (error) {
    //     throw new Error(error);
    // }

    // try {
    //     const uploader = (path) => cloudinaryUploadImg(path, "images");
    //     const urls = [];
    //     const files = req.files;
    //     for (const file of files) {
    //         const { path } = file;
    //         const newpath = await uploader(path);
    //         console.log(newpath);
    //         urls.push(newpath);
    //         fs.unlinkSync(path);
    //     }
    //     const images = urls.map((file) => {
    //         return file;
    //     });
    //     res.json(images);
    // } catch (error) {
    //     throw new Error(error);
    // }
});
const deleteImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = cloudinaryDeleteImg(id, "images");
        res.json({ message: "Deleted" });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    uploadImages,
    deleteImages,
    uploadImagesname,
};