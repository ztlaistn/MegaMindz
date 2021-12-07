import express from "express";
import jwt from "jsonwebtoken";

export function tokenAuthorization(req, res, next) {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        return res.status(401).json({message: "Unauthorized. Please log in again"});
    }
    const token = authHeader.split(" ")[1];
    try {
      const data = jwt.verify(token, process.env.TOKEN_SECRET);
      req.body.userId = data.userId;
      return next();
    } catch(err) {
      return res.status(403).json({message: "Access Denied."});
    }
};

/*
     * Function to validate the tocken passed to socket connection.
     * Parameters:
     *      token_data: token passed from socket function in the same way it is passed to backened routes from frontend.
     *                  This means that it will be "bearer <token data>"
     * Returns:
     *      If valid, will return the userId
     *      If invalid, will return -1
     */
export function validateSocketToken(token_data){
    if(!token_data){
      return -1;
    }

    const token = token_data.split(" ")[1];
    try{
        const data = jwt.verify(token, process.env.TOKEN_SECRET);
        const retVal = data.userId;
        return retVal;
    } catch (err){
        return -1;
    }
};
