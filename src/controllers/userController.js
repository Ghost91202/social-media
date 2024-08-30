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
exports.deleteUserProfile = exports.updateUserProfile = exports.getUserProfile = void 0;
const db_1 = __importDefault(require("../config/db"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const stream_1 = require("stream");
// Helper function to convert Buffer to Readable stream
const bufferToStream = (buffer) => {
    const readable = new stream_1.Readable();
    readable._read = () => { }; // _read is required but not used
    readable.push(buffer);
    readable.push(null); // Indicates end of stream
    return readable;
};
// Helper function to upload image to Cloudinary
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
// Get user profile
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const requesterId = req.userId; // Assuming you have userId in req from auth middleware
    try {
        const user = yield db_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.privacy === 'PRIVATE' && userId !== requesterId) {
            return res.status(403).json({ message: 'Access denied: Profile is private' });
        }
        const profile = yield db_1.default.userProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.getUserProfile = getUserProfile;
// Update user profile
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req.params;
    const { fullName, bio, location, website, privacy } = req.body;
    const files = req.files;
    const profilePictureFile = (_a = files === null || files === void 0 ? void 0 : files.profilePicture) === null || _a === void 0 ? void 0 : _a[0];
    const coverPhotoFile = (_b = files === null || files === void 0 ? void 0 : files.coverPhoto) === null || _b === void 0 ? void 0 : _b[0];
    try {
        const existingProfile = yield db_1.default.userProfile.findUnique({ where: { userId } });
        if (!existingProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }
        let profilePictureUrl = existingProfile.profilePicture;
        let coverPhotoUrl = existingProfile.coverPhoto;
        if (profilePictureFile && profilePictureFile.buffer) {
            profilePictureUrl = yield uploadImage(profilePictureFile.buffer);
        }
        if (coverPhotoFile && coverPhotoFile.buffer) {
            coverPhotoUrl = yield uploadImage(coverPhotoFile.buffer);
        }
        const updatedProfile = yield db_1.default.user.update({
            where: { id: userId },
            data: {
                profile: {
                    update: {
                        fullName,
                        bio,
                        profilePicture: profilePictureUrl,
                        coverPhoto: coverPhotoUrl,
                        location,
                        website,
                    },
                },
                privacy, // Update the privacy setting
            },
        });
        res.status(200).json({ message: 'User profile updated successfully', profile: updatedProfile });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.updateUserProfile = updateUserProfile;
// Delete user profile
const deleteUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    // Ensure the requester is deleting their own profile
    if (userId !== req.userId) {
        return res.status(403).json({ message: 'Forbidden: Cannot delete another user\'s profile' });
    }
    try {
        const existingProfile = yield db_1.default.userProfile.findUnique({ where: { userId } });
        if (!existingProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }
        yield db_1.default.userProfile.delete({ where: { userId } });
        res.status(200).json({ message: 'User profile deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.deleteUserProfile = deleteUserProfile;
