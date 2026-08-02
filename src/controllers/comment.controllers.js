import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const comments = await Comment.find({
        video: videoId
    })
    .populate("Owner", "userName fullName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            comments,
            "Comments fetched successfully!"
        )
    );
});

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {content} = req.body;
    const user = req.user._id;
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError("Video with the given id not found!")
    }
    const comment = await Comment.create({
        content:content,
        video:videoId,
        Owner:user
    })
    if(!comment){
        throw new ApiError(500,"Failed to upload comment")
    }
    return res
    .status(200)
    .json( new ApiResponse(200,comment,"Comment uploaded") )

    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body
    const userid = req.user._id;

    if(!content){
        throw new ApiError(500,"Content required to update comment")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment not found!")
    }
    if(!comment.Owner.equals(userid)){
        throw new ApiError(500,"User not authorised to update the comment")
    }
    const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
        $set: {
            content: content
        }
    },
    {
        new: true
    }
);
return res
.status(200)
.json( new ApiResponse(200,updatedComment,"The comment updated successfully!"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}= req.params
    const userid = req.user._id;
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment not found!")
    }
    if(!comment.Owner.equals(userid)){
        throw new ApiError(500,"User not authorised to delete comment")
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if(!deletedComment){
        throw new ApiError(500,"Failed to delete comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,"Comment deleted successfully!"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
