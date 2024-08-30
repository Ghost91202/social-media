"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeComment = exports.replyToComment = exports.commentOnPost = exports.likePost = exports.getPosts = exports.createPost = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const db_1 = __importDefault(require("../config/db"));
const stream_1 = require("stream");
// Convert buffer to a readable stream
const bufferToStream = (buffer) => {
    const readable = new stream_1.Readable();
    readable._read = () => { }; // _read is required but not used
    readable.push(buffer);
    readable.push(null); // Indicates end of stream
    return readable;
};
const uploadImage = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = bufferToStream(buffer);
        const uploadStream = cloudinary_1.default.uploader.upload_stream((error, result) => {
            if (error) {
                return reject(error);
            }
            resolve((result === null || result === void 0 ? void 0 : result.secure_url) || '');
        });
        stream.pipe(uploadStream);
    });
};
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, content, isPublic } = req.body;
    const file = req.file;
    try {
        let imageUrl = null;
        if (file) {
            imageUrl = yield uploadImage(file.buffer);
        }
        const isPublicBoolean = isPublic === 'true';
        const post = yield db_1.default.post.create({
            data: {
                userId,
                content,
                imageUrl,
                isPublic: isPublicBoolean,
            },
        });
        res.status(201).json({ message: 'Post created successfully', post });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.createPost = createPost;
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield db_1.default.post.findMany({
            include: {
                user: true,
                comments: true,
                likes: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(posts);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.getPosts = getPosts;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const { userId } = req.body; // In real apps, extract this from auth middleware.
    try {
        // Check if the post exists
        const post = yield db_1.default.post.findUnique({ where: { id: postId } });
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        // Check if the user already liked the post
        const existingLike = yield db_1.default.like.findFirst({
            where: { postId, userId },
        });
        if (existingLike) {
            return res.status(400).json({ message: 'Post already liked by this user' });
        }
        // Create the like
        const like = yield db_1.default.like.create({
            data: { postId, userId },
        });
        res.status(201).json({ message: 'Post liked successfully', like });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.likePost = likePost;
// Comment on a post
const commentOnPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const { userId, content } = req.body;
    console.log("comment testing ");
    try {
        // Check if the post exists
        const post = yield db_1.default.post.findUnique({ where: { id: postId } });
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        // Create the comment
        const comment = yield db_1.default.comment.create({
            data: {
                postId,
                userId,
                content,
            },
        });
        res.status(201).json({ message: 'Comment added successfully', comment });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.commentOnPost = commentOnPost;
// Reply to a comment
const replyToComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.params;
    const { userId, content } = req.body;
    try {
        // Check if the parent comment exists
        const parentComment = yield db_1.default.comment.findUnique({ where: { id: commentId } });
        if (!parentComment)
            return res.status(404).json({ message: 'Comment not found' });
        // Create the reply
        const reply = yield db_1.default.comment.create({
            data: {
                userId,
                content,
                parentId: commentId,
                postId: parentComment.postId, // inherit the postId from the parent comment
            },
        });
        res.status(201).json({ message: 'Reply added successfully', reply });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.replyToComment = replyToComment;
// Like a comment
const likeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.params;
    const { userId } = req.body;
    try {
        // Check if the comment exists
        const comment = yield db_1.default.comment.findUnique({ where: { id: commentId } });
        if (!comment)
            return res.status(404).json({ message: 'Comment not found' });
        // Check if the user already liked the comment
        const existingLike = yield db_1.default.like.findFirst({
            where: { commentId, userId },
        });
        if (existingLike) {
            return res.status(400).json({ message: 'Comment already liked by this user' });
        }
        // Create the like
        const like = yield db_1.default.like.create({
            data: { commentId, userId },
        });
        res.status(201).json({ message: 'Comment liked successfully', like });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.likeComment = likeComment;
