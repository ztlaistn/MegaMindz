import React, { useRef, useState } from 'react'
import Phaser from 'phaser'
import { GameComponent } from 'phaser-react-tools'
import io from "socket.io-client/dist/socket.io";
import "./styles/Gamified.css";

//Import game images here
import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";
import chatroom_sprite_default from "../assets/sample-profile-cropped.png";
import chatroom_sprite_1 from "../assets/sprite1.png";
import chatroom_sprite_2 from "../assets/sprite2.png";
import chatroom_sprite_3 from "../assets/sprite3.png";
import chatroom_sprite_4 from "../assets/sprite4.png";

import chatroom_sprite_test from "../assets/chatroom-idle-test.png";

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
                console.log(chatroom_sprite_1)
                this.load.image('background',chatroom_background);
                this.load.image('s0', chatroom_sprite_default);
                this.load.image('s1', chatroom_sprite_1);
                this.load.image('s2', chatroom_sprite_2);
                this.load.image('s3', chatroom_sprite_3);
                this.load.image('s4', chatroom_sprite_4);
            },
            create: function() {
                //Add background; define sizes
                this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');
                this.background.setDisplaySize(window.innerWidth, window.innerHeight);
                this.background.setInteractive();

                //Add other online characters
                this.otherPlayers = this.add.group();
                this.otherNames = this.add.group();

                let self = this;

                socket.on('update-all-positions', function(players) {
                    console.log(players);
                    players.forEach((player) =>{
                        if(player.username !== sessionStorage.getItem("username")){
                            if(!self.otherPlayers.getChildren().includes(player.username)){
                                const otherPlayer = self.add.sprite(player.x, player.y, "s" + player.sprite);
                                otherPlayer.playerId = player.username;
                                otherPlayer.displayWidth = 100;
                                otherPlayer.displayHeight = 128;
                                self.otherPlayers.add(otherPlayer);
                            }
                            if(!self.otherNames.getChildren().includes(player.username)){
                                const otherName = self.add.text((player.x - 40), (player.y + 70), player.username, { fontFamily: 'Work Sans', color: '#FFFFFF', stroke: '#000000', strokeThickness: 5 });
                                otherName.playerId = player.username;
                                self.otherNames.add(otherName);
                            }
                        }else{
                            self.character = self.add.sprite(player.x, player.y, "s" + player.sprite);
                            self.character.displayWidth = 100;
                            self.character.displayHeight = 128;
                            self.name = self.add.text((player.x - 40), (player.y + 70), sessionStorage.getItem("username"), { fontFamily: 'Work Sans', color: '#FFFFFF', stroke: '#000000', strokeThickness: 5 });
                        }
                    })
                });
                
                //Populate the room with other characters
                socket.on('new-character-event', function(player){
                    if(player.username !== sessionStorage.getItem("username")){
                        const otherPlayer = self.add.sprite(player.x, player.y, "s" + player.sprite);
                        otherPlayer.playerId = player.username;
                        otherPlayer.displayWidth = 100;
                                otherPlayer.displayHeight = 128;
                        self.otherPlayers.add(otherPlayer);


                        const otherName = self.add.text((player.x - 40), (player.y + 70), player.username, { fontFamily: 'Work Sans', color: '#FFFFFF', stroke: '#000000', strokeThickness: 5 });
                        otherName.playerId = player.username;
                        self.otherNames.add(otherName);
                    }
                });
                
                //Removes the character locally and in other games upon disconnect
                socket.on('member-left-room', function(player) {
                    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                        if (player.username === otherPlayer.playerId) {
                            otherPlayer.destroy();
                        }
                    });
                    self.otherNames.getChildren().forEach(function(otherName) {
                        if (player.username === otherName.playerId) {
                            otherName.destroy();
                        }
                    })
                });

                //Updates the movement of characters on the local screen
                socket.on('new-move', function(player) {
                    // console.log(player);
                    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                        if (player.username === otherPlayer.playerId) {
                            otherPlayer.setPosition(player.x, player.y);
                        }
                    });
                    self.otherNames.getChildren().forEach(function(otherName) {
                        if (player.username === otherName.playerId) {
                            otherName.setPosition((player.x - 40), (player.y + 70));
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
                if (this.character){
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
    
                    //Perform distance calculations
                    this.otherNames.getChildren().forEach((otherName) => {
                        if(Math.sqrt((Math.pow((otherName.x - this.name.x), 2)) + (Math.pow((otherName.y - this.name.y), 2))) < 250){
                            otherName.setStyle({ fontFamily: 'Work Sans', color: '#34FF00', stroke: '#000000', strokeThickness: 5 });
                        } else {
                            otherName.setStyle({ fontFamily: 'Work Sans', color: '#FF021F', stroke: '#000000', strokeThickness: 5 });
                        }
                    });
    
                    //Perform movement calculations
                    if(Math.abs(this.character.x - this.character.getData("positionX")) <= 10) {
                        this.character.x = this.character.getData("positionX");
                        this.name.x = this.character.getData("positionX") - 40;
                    } else if(this.character.x < this.character.getData("positionX")) {
                        this.character.x += 5;
                        this.name.x += 5;
                    } else if(this.character.x > this.character.getData("positionX")) {
                        this.character.x -= 5;
                        this.name.x -= 5;
                    }
                    if(Math.abs(this.character.y - this.character.getData("positionY")) <= 10) {
                        this.character.y = this.character.getData("positionY");
                        this.name.y = this.character.getData("positionY") + 70;
                    } else if(this.character.y < this.character.getData("positionY")) {
                        this.character.y += 5;
                        this.name.y += 5;
                    } else if(this.character.y > this.character.getData("positionY")) {
                        this.character.y -= 5;
                        this.name.y -= 5;
                    }
    
                    var x = this.character.x;
                    var y = this.character.y;
                    if (this.character.oldPosition && (x !== this.character.oldPosition.x || y !== this.character.oldPosition.y)) {
                        socket.emit('new-move', {auth: "Bearer " + sessionStorage.getItem("token"), move: { x: this.character.x, y: this.character.y}});
                    }
                }
            }
        }
    }}
    />
    )
}