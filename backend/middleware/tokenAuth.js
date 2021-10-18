import express from "express";
import jwt from "jsonwebtoken";

export default function tokenAuthorization(req, res, next) {
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
