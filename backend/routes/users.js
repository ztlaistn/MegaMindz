import express, { Router } from "express";

const router = express.Router();

export default (app) => {
  app.use("/users", router);

  router.get('/test1', function (req, res) {
    res.send('Users home page')
  });
  // define the about route
  router.get('/test2', function (req, res) {
    res.send('Users birds')
  });

}
