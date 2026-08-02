import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscriptions.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id
    const channelsSubscribed = await Subscription.find({subscriber:userId})
    const subscribedChannel = await channelsSubscribed.find((subscription)=>{
       if(subscription.channel==channelId)
        return subscription
    })
    if(!subscribedChannel){
        const newSubscription =await Subscription.create({
            subscriber:userId,
            channel:channelId
        })
        await newSubscription.save();
        if(!newSubscription){
            throw new ApiError(500,"Failed to subscribe to the channel!")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,newSubscription,"User subscribed to the channel successfully!")
        )
    }
    else{
        const deletedSubscription = await Subscription.findByIdAndDelete(subscribedChannel._id)
        res
        .status(200)
        .json(new ApiResponse(200,deletedSubscription,"The user successfully unsubscribed from the channel"))
    }
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log("channelId:", channelId);
    const subscribers = await Subscription.find({
        channel:channelId
    }).select("subscriber")
    
    if(!subscribers){
        throw new ApiError(404,"No subscriptions found to this channel")
    }
    console.log(subscribers)
    return res
    .status(200)
    .json( new ApiResponse(200,subscribers,"Subscribers fetched successfully!"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const channels = await Subscription.find({
        subscriber:subscriberId
    }).select("channel")
    if(!channels){
        throw new ApirError(404,"User not subscribed to any channel")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,channels,"Subscribed channels fethched successfully!")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}