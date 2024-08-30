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
exports.authorizeProfileAccess = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const SECRET_KEY = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImthcmFuIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.kUDYWGXGSMM2Q2wDrFkgFYZf_DHty-mxzaViig0nzvE';
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        req.user = {
            id: decoded.userId,
            username: decoded.username,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});
exports.authenticate = authenticate;
const authorizeProfileAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const currentUserId = req.userId;
    try {
        const profile = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { privacy: true }
        });
        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (profile.privacy === 'PRIVATE' && userId !== currentUserId) {
            return res.status(403).json({ message: 'Access denied: Profile is private' });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.authorizeProfileAccess = authorizeProfileAccess;
