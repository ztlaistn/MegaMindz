import React, { useRef, useState } from 'react'
import Phaser from 'phaser'
import { GameComponent } from 'phaser-react-tools'
import io from "socket.io-client/dist/socket.io";
import "./styles/Gamified.css";

//Import game images here
import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";

//Initialize game as HTML component
export default function Gamified({socket, username}) {
    var isClicking = false;
    console.log(socket);
    return(
    <GameComponent
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
                //Populate the room with other characters
                socket.on('new-character-event', function(player){
                    const otherPlayer = self.add.sprite(player.x, player.y, 'character');
                    otherPlayer.playerId = player.username;
                    self.otherPlayers.add(otherPlayer);
                });
                this.character = this.add.sprite(100, 200, 'character');

                //Removes the character locally and in other games upon disconnect
                socket.on('disconnect', function(playerId) {
                    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                        if (playerId === otherPlayer.playerId) {
                            otherPlayer.destroy();
                        }
                    })
                });

                //Updates the movement of characters on the local screen
                socket.on('new-move', function(player) {
                    console.log(player);
                    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                        if (player.username === otherPlayer.playerId) {
                            otherPlayer.setPosition(player.x, player.y);
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
                // save old position data
                this.character.oldPosition = {
                  x: this.character.x,
                  y: this.character.y,
                };
                //Define character movement (click to move)
                //Check if mouse pointer was clicked or screen was tapped
                if(!this.input.activePointer.isDown && isClicking === true) {
                    this.character.setData("positionX", this.input.activePointer.position.x);
                    this.character.setData("positionY", this.input.activePointer.position.y);
                    isClicking = false;
                }

                //Perform movement calculations
                if(Math.abs(this.character.x - this.character.getData("positionX")) <= 10) {
                    this.character.x = this.character.getData("positionX");
                } else if(this.character.x < this.character.getData("positionX")) {
                    this.character.x += 5;
                } else if(this.character.x > this.character.getData("positionX")) {
                    this.character.x -= 5;
                }
                if(Math.abs(this.character.y - this.character.getData("positionY")) <= 10) {
                    this.character.y = this.character.getData("positionY");
                } else if(this.character.y < this.character.getData("positionY")) {
                    this.character.y += 5;
                } else if(this.character.y > this.character.getData("positionY")) {
                    this.character.y -= 5;
                }

                var x = this.character.x;
                var y = this.character.y;
                if (this.character.oldPosition && (x !== this.character.oldPosition.x || y !== this.character.oldPosition.y)) {
                  socket.emit('new-move', { x: this.character.x, y: this.character.y, username: username });
                }
            }
        }
    }}
    />
    )
}