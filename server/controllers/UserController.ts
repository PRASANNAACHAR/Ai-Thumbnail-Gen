import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";


// controller to  get all user thumbnail
export const getUserThumbnails = async(req:Request, res: Response) =>{
    try {
        const {userId}  = req.session;

        const thumbnail =await Thumbnail.find({userId}).sort({createdAt: -1})
        res.json({thumbnail})
    } catch (error :any) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
}

// controllers to get single thumbnail of user
export const getThumbnailbyId = async(req:Request, res: Response) =>{
    try {
        const {userId} = req.session;
        const {id} = req.params;

        const thumbail = await Thumbnail.findOne({userId,_id:id});
        res.json({thumbail})
        
    } catch (error:any) {
       console.log(error)
        res.status(500).json({message: error.message}) 
    }
}