import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
   const getAllVideos = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const match = {
        isPublished: true
    };

    if (query) {
        match.$or = [
            {
                title: {
                    $regex: query,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: query,
                    $options: "i"
                }
            }
        ];
    }

    if (userId) {
        match.owner = new mongoose.Types.ObjectId(userId);
    }

    const sort = {
        [sortBy]: sortType === "asc" ? 1 : -1
    };

    const aggregate = Video.aggregate([
        {
            $match: match
        },
        {
            $sort: sort
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    fullname: "$owner.fullname",
                    avatar: "$owner.avatar"
                }
            }
        }
    ]);

    const videos = await Video.aggregatePaginate(aggregate, {
        page: Number(page),
        limit: Number(limit)
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    );
});
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(
    [title,description].some((field)=>field?.trim()==="")){
    throw new ApiError(400,"Title and description of the video required")}
    const videoLocalPath=req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath=req.files?.thumbnail?.[0]?.path
    if(!videoLocalPath){
        throw new ApiError(400,"Video is missing")
    }
    let video;
    try{
    video = await cloudinary.uploader.upload(videoLocalPath, {
    resource_type: "video",
    });
    console.log("Video uploaded",video)
    }
    catch(error){
    console.log("Error uploading video", error);
    throw error;   // temporary
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is missing")
    }
    let thumbnail;
    try{
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        console.log("Thumbnail uploaded",thumbnail)
    }
    catch(error){
        console.log("Error uploading thumbnail",error)
        throw new ApiError(500,"Failed to upload thumbnail")
    }
    const uploadedVideo = await Video.create({
        title,
        description,
        videoFile:video.secure_url,
        thumbnail:thumbnail.secure_url,
        duration:video.duration,
        views:0,
        isPublished:true,
        owner:req.user._id
    })
    if(!uploadedVideo){
        throw new ApiError(500,"Something went wrong while uploading the video")

    }
    return res
    .status(201)
    .json(new ApiResponse(200,uploadedVideo,"Video uploaded successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(404,"Video not found")
    }
    return res
    .status(200)
    .json( new ApiResponse(200,video,"Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description} = req.body
    //TODO: update video details like title, description, thumbnail
    if(!title||!description){
        throw new ApiError(400,"Video title and description is required")
    }
    const thumbnailLocalPath = req.file?.path
        if(!thumbnailLocalPath){
            throw new ApiError(400,"New thumbnail is required")}
            const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        
        if(!thumbnail.url){
            throw new ApiError(500,"Something went wrong while uploading coverImage")
        }
    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                title:title,
                description:description,
                thumbnail:thumbnail.url
            }
        },
        { new:true})
        return res.status(200).json(new ApiResponse(200,video,
                    "Video details updated successfully!"
        ))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(500, "Failed to delete video");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedVideo,
                "Video deleted successfully"
            )
        );
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const vid = await Video.findById(videoId)
    if(!vid){
        throw new ApiError(404,"Video not found")
    }
     const video = await Video.findByIdAndUpdate(videoId,
        {   
            $set:{
                isPublished: !(vid.isPublished)
            }
        },
        { new:true})
        return res.status(200).json(new ApiResponse(200,video,
                    "Video details updated successfully!"
        ))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
