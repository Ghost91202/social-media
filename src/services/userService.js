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
exports.findUserByEmail = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db"));
const saltRounds = 10;
const registerUser = (username, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passwordHash = yield bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = yield db_1.default.user.create({
            data: {
                username,
                email,
                passwordHash,
            },
        });
        // Create corresponding user profile
        yield db_1.default.userProfile.create({
            data: {
                userId: user.id, // Use the ID from the newly created user
                fullName: '', // Default values for profile fields
                bio: '',
                profilePicture: '',
                coverPhoto: '',
                location: '',
                website: '',
            },
        });
        return user; // Return the created user object
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.registerUser = registerUser;
// Find user by email
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.default.user.findUnique({
        where: { email },
    });
});
exports.findUserByEmail = findUserByEmail;
