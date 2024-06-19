const mongoose = require("mongoose");
const validateMongoDbId = (user_id) => {
    const isValid = mongoose.Types.ObjectId.isValid(user_id);
    if (!isValid) throw new Error("This id is not valid or not Found");
};
module.exports = validateMongoDbId;