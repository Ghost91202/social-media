"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const upload_1 = __importDefault(require("../middleware/upload")); // Import your multer config
const postController_1 = require("../controllers/postController");
const followController_1 = require("../controllers/followController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/profile/:userId', authMiddleware_1.authenticate, authMiddleware_1.authorizeProfileAccess, userController_1.getUserProfile);
router.put('/profile/:userId', authMiddleware_1.authenticate, authMiddleware_1.authorizeProfileAccess, upload_1.default, userController_1.updateUserProfile); // Use upload middleware
router.delete('/profile/:userId', authMiddleware_1.authenticate, authMiddleware_1.authorizeProfileAccess, userController_1.deleteUserProfile);
router.post('/:postId/like', authMiddleware_1.authenticate, postController_1.likePost);
// Comment on a post
router.post('/:postId/comment', authMiddleware_1.authenticate, postController_1.commentOnPost);
// Reply to a comment
router.post('/comments/:commentId/reply', authMiddleware_1.authenticate, postController_1.replyToComment);
// Like a comment
router.post('/comments/:commentId/like', authMiddleware_1.authenticate, postController_1.likeComment);
// follow routes
router.post('/:userId', authMiddleware_1.authenticate, followController_1.followUser);
router.get('/requests', authMiddleware_1.authenticate, followController_1.getFollowRequests);
router.post('/requests/:requestId/respond', authMiddleware_1.authenticate, followController_1.respondToFollowRequest);
exports.default = router;
