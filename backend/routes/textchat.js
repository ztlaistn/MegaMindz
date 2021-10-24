import express, { Router } from "express";

export default class Textchat => {
    app;
    io;

    constructor(app, io) {
        this.app = app;
        this.io = io;
    }
}
