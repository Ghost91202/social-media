"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// Set up Multer storage
const storage = multer_1.default.memoryStorage(); // Store files in memory buffer
// Define the fields that multer should handle
const upload = (0, multer_1.default)({ storage }).fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
]);
exports.default = upload;
