const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const shopSchema = new mongoose.Schema({
    shopName: { type: String, required: true, trim: true, unique: true },
    shopDescription: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    shopAddress: { type: String },
    businessCategory: { type: Array },
    whatsapp: { type: String, ref: 'User.whatsapp' },
    facebookLink: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },
    certified: { type: Boolean, default: false },
    shopEnabled: { type: Boolean, default: true },
    logo: { type: String },
    shopCoordsBack: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    selectedAddressCoordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    openingHours: { type: String },
    isActive: { type: Boolean, default: true },
    creationDate: { type: Date, default: Date.now, required: true },
    updatedDate: { type: Date, default: Date.now },
    isPremium: { type: Boolean, default: false },
});

shopSchema.plugin(uniqueValidator);

// Middleware pour mettre à jour updatedDate avant la mise à jour
shopSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedDate = Date.now();
    next();
});

shopSchema.pre('updateOne', function (next) {
    this.set({ updatedDate: Date.now() });
    next();
});

// Middleware pour s'assurer que creationDate ne peut pas être modifié
shopSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.creationDate = this.get('creationDate');
    }
    next();
});

module.exports = mongoose.model('Shop', shopSchema);
