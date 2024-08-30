import { Request, Response } from 'express';
import prisma from '../config/db';
import { io } from "../app"; // Import the io instance
// Follow a user
export const followUser = async ( req: Request, res: Response ) => {
  const { userId } = req.params;
  const followerId = req.userId; // Assumes userId is added to req by auth middleware
  const followedId = req.params.userId; // ID of the user being followed
   if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if ( !followerId ) {
    return res.status( 401 ).json( { message: 'Unauthorized' } );
  }

  try {
    const followedUser = await prisma.user.findUnique( { where: { id: userId } } );

    if ( !followedUser ) {
      return res.status( 404 ).json( { message: 'User not found' } );
    }

    if ( followedUser.privacy === 'PRIVATE' ) {
      // Create a follow request if the followed user is private
      await prisma.follow.create( {
        data: {
          followerId: followerId as string,
          followedId: userId,
          status: 'PENDING',
        },
      } );


      // notifications
      const notification = await prisma.notification.create( {
        data: {
          userId: followedId,
          senderId: followerId,
          type: "FOLLOW",
          message: `${ req.user.username } has sent you a follow request.`,
        },
      } );

      io.to( followedId ).emit( "notification", notification ); // Real-time notification



      res.status( 200 ).json( { message: 'Follow request sent' } );
    } else {
      // Follow directly if the followed user is public
      await prisma.follow.create( {
        data: {
          followerId: followerId as string,
          followedId: userId,
          status: 'ACCEPTED',
        },
      } );

      res.status( 200 ).json( { message: 'User followed successfully' } );
    }
  } catch ( error ) {
    res.status( 500 ).json( { message: 'Internal Server Error', error: ( error as Error ).message } );
  }
};

// Get follow requests
export const getFollowRequests = async ( req: Request, res: Response ) => {
  const userId = req.userId;

  if ( !userId ) {
    return res.status( 401 ).json( { message: 'Unauthorized' } );
  }

  try {
    const requests = await prisma.follow.findMany( {
      where: {
        followedId: userId,
        status: 'PENDING',
      },
      include: {
        follower: true,
      },
    } );

    res.status( 200 ).json( requests );
  } catch ( error ) {
    res.status( 500 ).json( { message: 'Internal Server Error', error: ( error as Error ).message } );
  }
};

// Respond to a follow request
export const respondToFollowRequest = async ( req: Request, res: Response ) => {
  const { requestId } = req.params;
  const { status } = req.body; // Should be either 'ACCEPTED' or 'REJECTED'

  try {
    const followRequest = await prisma.follow.findUnique( { where: { id: requestId } } );

    if ( !followRequest ) {
      return res.status( 404 ).json( { message: 'Follow request not found' } );
    }

    if ( followRequest.status !== 'PENDING' ) {
      return res.status( 400 ).json( { message: 'Request already responded to' } );
    }

    await prisma.follow.update( {
      where: { id: requestId },
      data: { status },
    } );

    res.status( 200 ).json( { message: 'Follow request updated successfully' } );
  } catch ( error ) {
    res.status( 500 ).json( { message: 'Internal Server Error', error: ( error as Error ).message } );
  }
};
