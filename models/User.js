const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    lastname: { type: String, trim: true },
    firstname: { type: String, trim: true },
    picture: { type: String, default: 'placeholder.png' },
    email: { type: String, unique: true, required: true, trim: true },
    phoneNo: { type: String, trim: true },
    whatsapp: { type: String, unique: true },
    password: { type: String, required: true },
    registerDate: { type: Date, default: Date.now },
    adress: { type: String },
    sex: { type: String },
    city: { type: String },
    country: { type: String },
    birthDate: { type: Date },
    coords: { type: [Number], index: '2dsphere' },
    certifyed: { type: Boolean, default: false },
    coordsUpdateTime: { type: Date },
    os: { type: String },
    deviceId: { type: String },
    shopSubscription: { type: String },
    deviceName: { type: String },
    firstTimeInstall: { type: Date },
    osVersion: { type: String },
    location: { type: String },
    lang: { type: String },
    last_login_date: { type: Date },
    // userRating: { type: Number, default: 0 },
    // userRatingNb: { type: Number, default: 0 },
    pushTokens: [{}],
    isConnected: { type: Boolean, default: false },
    canPost: { type: Boolean, default: true },
    isSubscribed: { type: Boolean, default: false },
    canDeleteAccount: { type: Boolean, default: false },
    haveShop: { type: Boolean, default: false },
    userEnabled: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date },
    shops: { type: Number, default: 0 },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema, 'users');
