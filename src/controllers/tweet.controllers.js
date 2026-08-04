import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const {content} = req.body
    if(!content){
        throw new ApiError(500,"Content required for creating tweet!")
    }
    const newTweet = await Tweet.create({
        content:content,
        Owner:userId
    })
    await newTweet.save()
    if(!newTweet){
        throw new ApiError(500,"Failed to upload tweet")
    }
    return res.status(200)
    .json(new ApiResponse(200,newTweet,"Tweet posted successfully!"))

    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId}=req.params
    const tweets = await Tweet.find({
        Owner:userId
    })
    if(!tweets){
        throw new ApiError(404,"No user tweets found")
    }
    return res
    .status(200)
    .json( new ApiResponse(200,tweets,"Tweets fetched successfully!"))
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {content} = req.body
    const tweet = await Tweet.findById(tweetId);

if (!tweet) {
    throw new ApiError(404, "Tweet not found");
}

if (!tweet.Owner.equals(req.user._id)) {
    throw new ApiError(403, "Not authorized");
}
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId
        ,{
            $set:{
            content:content
        }},
        {
            new:true
        }
    )
   
    return res
    .status(200)
    .json(new ApiResponse(200,updatedTweet,"Tweet updated successfully!"))

    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    if(!tweet.Owner.equals(req.user._id)){
        throw new ApiError(403,"User not authorised to delete tweet!")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    if(!deleteTweet){
        new ApiError(500,"Failed to delete tweet")
    }
    return res
    .status(200)
    .json( new ApiResponse(200,"Tweet delted successfully!"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}