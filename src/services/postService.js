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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getPostById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.post.findUnique({
        where: { id },
        include: {
            comments: true,
            likes: true,
        },
    });
});
exports.getPostById = getPostById;
const createPost = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.post.create({
        data,
    });
});
exports.createPost = createPost;
const updatePost = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.post.update({
        where: { id },
        data,
    });
});
exports.updatePost = updatePost;
const deletePost = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.post.delete({
        where: { id },
    });
});
exports.deletePost = deletePost;
