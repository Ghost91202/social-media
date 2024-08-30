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
exports.createPost = void 0;
const db_1 = __importDefault(require("../config/db"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const userId = req.userId; // Now TypeScript knows about this property
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const post = yield db_1.default.post.create({
            data: {
                content,
                userId,
            },
        });
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.createPost = createPost;
