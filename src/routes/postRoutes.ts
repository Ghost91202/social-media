import { Router } from 'express';
import upload from '../config/fileUpload';
import { createPost, getPosts } from '../controllers/postController';
import { likePost, commentOnPost, replyToComment, likeComment } from '../controllers/postController';

const router = Router();

// Create a new post with an image upload
router.post('/create', upload.single('file'), createPost);
router.post('/:postId/like', likePost);
router.post('/:postId/comment', commentOnPost);
router.post('/comments/:commentId/reply', replyToComment);
router.post('/comments/:commentId/like', likeComment);
// Get all posts
router.get('/', getPosts);

export default router;
