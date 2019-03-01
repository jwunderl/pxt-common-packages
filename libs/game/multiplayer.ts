namespace multiplayer {
    export class Player {
        id: number;
        // Requests info from context.players[id-1]
        // redirect calls to relevant segment - info, score, etc
        controller: controller.Controller;

        constructor(id: number) {
            this.id = id;
            if (!players)
                players = [];
            players[i - 1] = this;
            this.controller = new controller.Controller(id, undefined);
        }
        
    }

    //% fixedInstance whenUsed block="player 1"
    export const player1 = new Player(1);
    //% fixedInstance whenUsed block="player 2"
    export const player2 = new Player(2);
    //% fixedInstance whenUsed block="player 3"
    export const player3 = new Player(3);
    //% fixedInstance whenUsed block="player 4"
    export const player4 = new Player(4);
    
    class PlayerState {
        // controls (buttons & events) 
        // info state - score, life, visibility, life over handler
        // sprites
    }

    class Context {
        players: PlayerState[];
        private scene: scene.Scene;

        constructor() {
            this.scene = game.currentScene();
            this.players = [];
        }

        isActive() {
            return this.scene === game.currentScene();
        }
    }

    let players: Player[];
    let contextStack: Context[];
    let currentContext: Context;

    game.addScenePushHandler(() => {
        if (currentContext) {
            if (!contextStack) {
                contextStack = [];
            }

            contextStack.push(currentContext);
            currentContext = undefined;
        }
    });

    game.addScenePopHandler(() => {
        if (contextStack && contextStack.length && contextStack[contextStack.length - 1].isActive()) {
            currentContext = contextStack.pop();
        } else {
            currentContext = undefined;
        }
    });

}