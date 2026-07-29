import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description)
    {
        throw new ApiError(500,"name and description of playlist required")
    }
    const playlist = await Playlist.create({
        name,
        description,
        video:[],
        Owner:req.user._id

    })
    if(!playlist)
    {
        throw new ApiError(500,"Something went wrong while creating playlist")
    }
    return res
    .status(201)
    .json(new ApiResponse(200,playlist,"Playlist created successfully"))
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const playlists = await Playlist.find({
        Owner:userId
    })
    if(!playlists){
        throw new ApiError(404,"No playlists found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlists,"Playlist found successfully!"))
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const playlists = await Playlist.findById(playlistId)
    if(!playlists){
        throw new ApiError(404,"No playlist by this id found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlists,"Playlists fetched succesfully"))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !videoId){
        throw new ApiError(400,"playlistId and videoId are required")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"No playlist with the given id found")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"No video with the given id found")
    }
    playlist.video.push(videoId)
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Video added to the playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !videoId){
        throw new ApiError("PlaylistId and videoId required fields")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"No playlist with the given id found")
    }
    
    playlist.video = playlist.video.filter((vId)=>{
        if(vId!=videoId)
            return videoId
    })
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"The video with the given id successfully removed from playlist"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if(!playlist){
        throw new ApiError(400,"Playlist doesn't exist")
    }
    return res
    .status(200)
    .json( new ApiResponse(200,playlist,"Playlist deleted successfully!"))
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!name||!description){
        throw new ApiError(400,"Name and description of playlist required")
    }
    const playlist = await Playlist.findByIdAndUpdate(
          playlistId,
            {
                $set:{
                name:name,
                description:description
            }
        }
        
    )
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist name and description updated successfully!"))
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
