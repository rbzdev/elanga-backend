const mongoose = require('mongoose')

const articlesSchema = new mongoose.Schema({
    title : { type: String, required : false },
    description : { type: String, required : false},
    price : {type: Number, required : false },
    currency : { type: String, required : false },
    stock : { type: String, required : false },
    image : { type: [String], required : true},
    owner : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId : { type: String, required: true },
    isActive : { type: Boolean, required : true, default : true},
    isDeliverable : { type: Boolean, default : false, required : true},
    creationDate : { type: Date, required : true, default : Date.now},
    updatedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Article', articlesSchema);