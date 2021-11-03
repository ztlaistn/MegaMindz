import React, { useRef, useState } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import "./styles/Gamified.css";

//Import game images here
import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";

var isClicking = false;

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
            //Add background; define sizes
            this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');
            this.background.setDisplaySize(window.innerWidth, window.innerHeight);
            this.background.setInteractive();

            //Add character
            this.character = this.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'character');

            //character movement detection (debug)
            this.key_W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.key_A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.key_S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.key_D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

            //Event listener for clicking on background to move
            //ensures that clicking outside the game doesn't move the character
            this.background.on('pointerdown', function () {
                isClicking = true;
            });
        },
        update: function() {
            //Defines character movement (debug)
            if(this.key_W.isDown){
                this.character.y -= 5;
            }
            if(this.key_A.isDown){
                this.character.x -= 5;
            }
            if(this.key_S.isDown){
                this.character.y += 5;
            }
            if(this.key_D.isDown){
                this.character.x += 5;
            }

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