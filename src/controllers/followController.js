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
exports.respondToFollowRequest = exports.getFollowRequests = exports.followUser = void 0;
const db_1 = __importDefault(require("../config/db"));
const app_1 = require("../app"); // Import the io instance
// Follow a user
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const followerId = req.userId; // Assumes userId is added to req by auth middleware
    const followedId = req.params.userId; // ID of the user being followed
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!followerId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const followedUser = yield db_1.default.user.findUnique({ where: { id: userId } });
        if (!followedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (followedUser.privacy === 'PRIVATE') {
            // Create a follow request if the followed user is private
            yield db_1.default.follow.create({
                data: {
                    followerId: followerId,
                    followedId: userId,
                    status: 'PENDING',
                },
            });
            // notifications
            const notification = yield db_1.default.notification.create({
                data: {
                    userId: followedId,
                    senderId: followerId,
                    type: "FOLLOW",
                    message: `${req.user.username} has sent you a follow request.`,
                },
            });
            app_1.io.to(followedId).emit("notification", notification); // Real-time notification
            res.status(200).json({ message: 'Follow request sent' });
        }
        else {
            // Follow directly if the followed user is public
            yield db_1.default.follow.create({
                data: {
                    followerId: followerId,
                    followedId: userId,
                    status: 'ACCEPTED',
                },
            });
            res.status(200).json({ message: 'User followed successfully' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.followUser = followUser;
// Get follow requests
const getFollowRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const requests = yield db_1.default.follow.findMany({
            where: {
                followedId: userId,
                status: 'PENDING',
            },
            include: {
                follower: true,
            },
        });
        res.status(200).json(requests);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.getFollowRequests = getFollowRequests;
// Respond to a follow request
const respondToFollowRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const { status } = req.body; // Should be either 'ACCEPTED' or 'REJECTED'
    try {
        const followRequest = yield db_1.default.follow.findUnique({ where: { id: requestId } });
        if (!followRequest) {
            return res.status(404).json({ message: 'Follow request not found' });
        }
        if (followRequest.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request already responded to' });
        }
        yield db_1.default.follow.update({
            where: { id: requestId },
            data: { status },
        });
        res.status(200).json({ message: 'Follow request updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.respondToFollowRequest = respondToFollowRequest;
