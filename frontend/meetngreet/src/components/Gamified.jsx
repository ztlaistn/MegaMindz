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

            //Event listener for clicking on background to move
            //ensures that clicking outside the game doesn't move the character
            this.background.on('pointerdown', function () {
                isClicking = true;
            });
        },
        update: function() {
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