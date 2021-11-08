import React, { useRef, useState } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import "./styles/Gamified.css";
import io from "socket.io-client/dist/socket.io";

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
            var self = this;
            //Add background; define sizes
            this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');
            this.background.setDisplaySize(window.innerWidth, window.innerHeight);
            this.background.setInteractive();

            //Add other online characters
            this.otherPlayers = this.add.group();
            this.socket = io.connect("/")
            this.socket.on("connection", (socket) => {
              socket.join(sessionStorage.getItem("roomID"));
            });
            //Populate the room with all characters
            this.socket.on('currentUsers', function(players){
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

            //Add a new character to the local game
            this.socket.on('newUser', function(playerInfo) {
                console.log("newUser");
                const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'character');
                otherPlayer.playerId = playerInfo.playerId;
                self.otherPlayers.add(otherPlayer);
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
            this.socket.on('userMoved', function(playerInfo) {
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

        }
    }
}

//Initialize game as HTML component
export default function Gamified() {
    const gameRef = useRef(null);
    const initialize = useState(true);
        return (
            <div className="game">
                <IonPhaser ref={gameRef} game={game} initialize={initialize}/>
            </div>
      );

}