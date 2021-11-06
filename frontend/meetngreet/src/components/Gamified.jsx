import React, { useRef, useState } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import "./styles/Gamified.css";
import io from "socket.io-client";

//Import game images here
import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";

var isClicking = false;
var playerDict = {}

const game = {
    //Define game element
    width: "70%",
    height: "80%",
    type: Phaser.AUTO,
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
            //Initialize socket connection
            this.socket = io();

            //Add background; define sizes
            this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');
            this.background.setDisplaySize(window.innerWidth, window.innerHeight);
            this.background.setInteractive();

            //Add local character
            var self = this;

            //Add other online characters
            this.otherPlayers = this.add.group();

            //Populate the room with all characters
            this.socket.on('currentPlayers', function(players){
                Object.keys(players).forEach(function (id){
                    if (players[id].playerId === self.socket.id) {
                        self.addPlayer(self, players[id]);
                    } else {
                        self.addOtherPlayers(self, players[id]);
                    }
                })
            });

            //Add a new character to the local game
            this.socket.on('newPlayer', function(playerInfo) {
                self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                   if (otherPlayer.playerId === playerInfo.playerId) {
                       otherPlayer.destroy()
                   }
                });
                self.addOtherPlayers(self, playerInfo);
            });

            //Removes the character locally and in other games upon disconnect
            this.socket.on('disconnect', function(playerId) {
                self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                    if (playerId === otherPlayer.playerId) {
                        otherPlayer.destroy();
                    }
                })
            });

            //Updates the movement of characters on the local screen
            this.socket.on('playerMoved', function(playerInfo) {
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
            let self = this;
            //Define character movement (click to move)
            //Check if mouse pointer was clicked or screen was tapped
            if(!this.input.activePointer.isDown && isClicking == true) {
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

            //Store character position on current tick
            var x = this.character.x;
            var y = this.character.y;

            //Check if old position is different from current position
            if (this.character.oldPosition && (x !== this.character.oldPosition.x || y !== this.character.oldPosition.y)) {
                this.socket.emit('playerMovement', { x: this.character.x, y: this.character.y});
            }

            //Store character position on last tick
            this.character.oldPosition = {
                x: this.character.x,
                y: this.character.y,
            };
        },
        addPlayer: function(self, playerInfo) {
            self.character = self.add.sprite(playerInfo.x, playerInfo.y, playerInfo.model);
        },
        addOtherPlayers: function(self, playerInfo) {
            const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, playerInfo.model);
            otherPlayer.playerId = playerInfo.playerId;
            self.otherPlayers.add(otherPlayer);
        }
    }
}

//Initialize game as HTML component
export default function Gamified() {
    const gameRef = useRef(null);
    const initialize = useState(true);
        return (
            <div className="game">
                <IonPhaser ref={gameRef} game={game} initialize={initialize} />
            </div>
      );

}