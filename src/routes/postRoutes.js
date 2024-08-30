"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileUpload_1 = __importDefault(require("../config/fileUpload"));
const postController_1 = require("../controllers/postController");
const postController_2 = require("../controllers/postController");
const router = (0, express_1.Router)();
// Create a new post with an image upload
router.post('/create', fileUpload_1.default.single('file'), postController_1.createPost);
router.post('/:postId/like', postController_2.likePost);
router.post('/:postId/comment', postController_2.commentOnPost);
router.post('/comments/:commentId/reply', postController_2.replyToComment);
router.post('/comments/:commentId/like', postController_2.likeComment);
// Get all posts
router.get('/', postController_1.getPosts);
exports.default = router;
