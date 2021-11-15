import React, { useRef, useState } from 'react'
import Phaser from 'phaser'
import { GameComponent } from 'phaser-react-tools'
import io from "socket.io-client/dist/socket.io";
import "./styles/Gamified.css";

//Import game images here
import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";

//Initialize game as HTML component
export default function Gamified({socket}) {
    var isClicking = false;
    return(
    //<GameComponent
    config={{
        //Define game element
        width: "70%",
        height: "80%",
        physics: {
            default: 'arcade'
        },
        scene: {
            preload: function() {
                //Load all assets used in the scene
                this.load.image('background',chatroom_background);
                this.load.image('character',chatroom_character);
            },
            create: function() {
                //Add background; define sizes
                this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');
                this.background.setDisplaySize(window.innerWidth, window.innerHeight);
                this.background.setInteractive();

                //Add other online characters
                this.otherPlayers = this.add.group();
                let self = this;
                //Populate the room with all characters
                socket.on('new-character-event', function(players){
                    console.log("currentUsers");
                    Object.keys(players).forEach(function (id){
                    if (players[id].playerId === sessionStorage.getItem("username")) {
                        self.character = self.add.sprite(players[id].x, players[id].y, 'character');
                    } else {
                        const otherPlayer = self.add.sprite(players[id].x, players[id].y, 'character');
                        otherPlayer.playerId = players[id].playerId;
                        self.otherPlayers.add(otherPlayer);
                    }
                    })
                });

                //Removes the character locally and in other games upon disconnect
                socket.on('disconnect', function(playerId) {
                    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                        if (playerId === otherPlayer.playerId) {
                            otherPlayer.destroy();
                        }
                    })
                });

                //Updates the movement of characters on the local screen
                socket.on('new-move', function(playerInfo) {
                    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                        if (playerInfo.playerId === otherPlayer.playerId) {
                            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                        }
                    })
                });

                //Event listener for clicking on background to move
                //ensures that clicking outside the game doesn't move the character
                this.background.on('pointerdown', function () {
                    isClicking = true;
                });
            },
            update: function() {
                //Define character movement (click to move)
                //Check if mouse pointer was clicked or screen was tapped
                if(!this.input.activePointer.isDown && isClicking === true) {
                    this.character.setData("positionX", this.input.activePointer.position.x);
                    this.character.setData("positionY", this.input.activePointer.position.y);
                    isClicking = false;
                }


            }
        }
    }}
    ///>
    )
}