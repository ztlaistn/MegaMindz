import express from "express";
import jwt from "jsonwebtoken";

export default function tokenAuthorization(req, res, next) {
  const token = req.body.token;
  if (!token) {
    return res.sendStatus(401).json({message: "Unauthorized. Please log in again"});
  }
  try {
    const data = jwt.verify(token, process.env.TOKEN_SECRET);
    req.body.userId = data.userId;
    return next();
  } catch {
    return res.sendStatus(403).json({message: "Access Denied."});
  }
};
