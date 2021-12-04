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
export default function Gamified({socket, username, setupStatus, mutePeerByUsername, mobile}) {
    var isClicking = false;
    var scene_width = "70%";
    var scene_height = "80%";
    var character_width = 100;
    var character_height = 128;
    var name_distance_x = 55;
    var name_distance_y = 70;
    var font_size = 20;
    var movement_speed = 5;
    if(mobile === true){
        scene_width = "100%";
        scene_height = "80%";
        character_width = character_width * 0.5;
        character_height = character_height * 0.5;
        name_distance_x = name_distance_x * 0.5;
        name_distance_y = name_distance_y * 0.5;
        font_size = font_size * 0.5;
    }
    var user_font_params = { fontFamily: 'Work Sans', color: '#FFFFFF', stroke: '#000000', strokeThickness: 5, fontSize: font_size };
    var active_font_params = { fontFamily: 'Work Sans', color: '#58CFEA', stroke: '#000000', strokeThickness: 5, fontSize: font_size };
    var inactive_font_params = { fontFamily: 'Work Sans', color: '#F5A623', stroke: '#000000', strokeThickness: 5, fontSize: font_size };
    console.log(socket);
    return(
    <GameComponent
    config={{
        //Define game element
        width: scene_width,
        height: scene_height,
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

                let gotUpdate = false;

                let self = this;

                socket.on('update-all-positions', function(players) {
                    console.log(players);
					if(self.gotUpdate){
						self.gotUpdate = true;
						players.forEach((player) =>{
							if(player.username !== sessionStorage.getItem("username")){
								if(!self.otherPlayers.getChildren().includes(player.username)){
									const otherPlayer = self.add.sprite(player.x, player.y, "s" + player.sprite);
									otherPlayer.playerId = player.username;
									otherPlayer.displayWidth = character_width;
									otherPlayer.displayHeight = character_height;
									self.otherPlayers.add(otherPlayer);
								}
								if(!self.otherNames.getChildren().includes(player.username)){
									const otherName = self.add.text((player.x - name_distance_x), (player.y + name_distance_y), player.username, user_font_params);
									otherName.playerId = player.username;
									self.otherNames.add(otherName);
								}
							}else{
								self.character = self.add.sprite(player.x, player.y, "s" + player.sprite);
								self.character.displayWidth = character_width;
								self.character.displayHeight = character_height;
								self.name = self.add.text((player.x - name_distance_x), (player.y + name_distance_y), sessionStorage.getItem("username"), user_font_params);
							}
						});
					}
                });

                // If we have not yet gotten an update all event (but we have connected), request one
                if(setupStatus && !gotUpdate){
                    console.log("Requesting another position update.")
                    const connData = {
                        auth: "Bearer " + sessionStorage.getItem("token"),
                    };
                    socket.emit('request-update-all', connData);
                }
                
                //Populate the room with other characters
                socket.on('new-character-event', function(player){
                    if(player.username !== sessionStorage.getItem("username")){
                        const otherPlayer = self.add.sprite(player.x, player.y, "s" + player.sprite);
                        otherPlayer.playerId = player.username;
                        otherPlayer.displayWidth = character_width;
                        otherPlayer.displayHeight = character_height;
                        self.otherPlayers.add(otherPlayer);


                        const otherName = self.add.text((player.x - name_distance_x), (player.y + name_distance_y), player.username, user_font_params);
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
                    });

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
                            otherName.setPosition((player.x - name_distance_x), (player.y + name_distance_y));
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
                            otherName.setStyle(active_font_params);
                            mutePeerByUsername(otherName.playerId, false);
                        } else {
                            otherName.setStyle(inactive_font_params);
                            mutePeerByUsername(otherName.playerId, true);
                        }
                    });
    
                    //Perform movement calculations
                    if(Math.abs(this.character.x - this.character.getData("positionX")) <= 10) {
                        this.character.x = this.character.getData("positionX");
                        this.name.x = this.character.getData("positionX") - name_distance_x;
                    } else if(this.character.x < this.character.getData("positionX")) {
                        this.character.x += movement_speed;
                        this.name.x += movement_speed;
                    } else if(this.character.x > this.character.getData("positionX")) {
                        this.character.x -= movement_speed;
                        this.name.x -= movement_speed;
                    }
                    if(Math.abs(this.character.y - this.character.getData("positionY")) <= 10) {
                        this.character.y = this.character.getData("positionY");
                        this.name.y = this.character.getData("positionY") + name_distance_y;
                    } else if(this.character.y < this.character.getData("positionY")) {
                        this.character.y += movement_speed;
                        this.name.y += movement_speed;
                    } else if(this.character.y > this.character.getData("positionY")) {
                        this.character.y -= movement_speed;
                        this.name.y -= movement_speed;
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