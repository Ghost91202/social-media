import express from 'express';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '../controllers/userController';
import upload from '../middleware/upload'; // Import your multer config
import { likePost, commentOnPost, replyToComment, likeComment } from '../controllers/postController';
import { followUser, getFollowRequests, respondToFollowRequest } from '../controllers/followController';


import { authenticate,  authorizeProfileAccess} from '../middleware/authMiddleware';


const router = express.Router();

router.get('/profile/:userId', authenticate, authorizeProfileAccess, getUserProfile);
router.put('/profile/:userId',authenticate, authorizeProfileAccess,  upload, updateUserProfile); // Use upload middleware
router.delete('/profile/:userId',authenticate, authorizeProfileAccess,  deleteUserProfile);
router.post('/:postId/like',authenticate, likePost);

// Comment on a post
router.post('/:postId/comment',authenticate, commentOnPost);

// Reply to a comment
router.post('/comments/:commentId/reply',authenticate, replyToComment);

// Like a comment
router.post('/comments/:commentId/like',authenticate, likeComment);



// follow routes
router.post('/:userId',authenticate, followUser);
router.get('/requests',authenticate, getFollowRequests);
router.post('/requests/:requestId/respond',authenticate, respondToFollowRequest);


export default router;
