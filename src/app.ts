import express from 'express';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import postRoutes from './routes/postRoutes';
import userRoutes from './routes/userRoutes'
import { Server } from "socket.io";
import http from "http";
// Load environment variables from .env file
dotenv.config();


const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust based on your front-end URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (userId) => {
    socket.join(userId); // Joins a room specific to the user
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
} );


app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follow',userRoutes);



export { app,io, server}
