const mongoose = require('mongoose'); 

const notificationSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    message: String,
    created_at: Date,
    is_read: Boolean,
    owner_id: String
});

module.exports = mongoose.model('Notification', notificationSchema);