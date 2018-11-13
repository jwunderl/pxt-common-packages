/**
 * Control the background, tiles and camera
 */
//% groups='["Background", "Tiles", "Camera"]'
namespace scene {
    export enum Flag {
        NeedsSorting = 1 << 1,
    }

    export class CollisionHandler {
        public type: number;
        public tile: number;
        public handler: (sprite: Sprite) => void;

        public constructor(type: number, tile: number, handler: (sprite: Sprite) => void) {
            this.type = type;
            this.tile = tile;
            this.handler = handler;
        }
    }

    export class Scene {
        eventContext: control.EventContext;
        background: Background;
        tileMap: tiles.TileMap;
        allSprites: SpriteLike[];
        private spriteNextId: number;
        spritesByKind: Sprite[][];
        physicsEngine: PhysicsEngine;
        camera: scene.Camera;
        flags: number;
        destroyedHandlers: sprites.SpriteHandler[];
        createdHandlers: sprites.SpriteHandler[];
        overlapHandlers: sprites.OverlapHandler[];
        collisionHandlers: CollisionHandler[];

        constructor(eventContext: control.EventContext) {
            this.eventContext = eventContext;
            this.flags = 0;
            this.physicsEngine = new ArcadePhysicsEngine();
            this.camera = new scene.Camera();
            this.background = new Background(this.camera);
            this.destroyedHandlers = [];
            this.createdHandlers = [];
            this.overlapHandlers = [];
            this.collisionHandlers = [];
            this.spritesByKind = [];
        }

        init() {
            if (this.allSprites) return;

            this.allSprites = [];
            this.spriteNextId = 0;
            scene.setBackgroundColor(0)
            // update controller state
            this.eventContext.registerFrameHandler(8, () => {
                control.enablePerfCounter("controller_update")
                const dt = this.eventContext.deltaTime;
                controller.__update(dt);
            })
            // update sprites in tilemap
            this.eventContext.registerFrameHandler(9, () => {
                control.enablePerfCounter("tilemap_update")
                if (this.tileMap) {
                    this.tileMap.update(this.camera);
                }
            })
            // apply physics 10
            this.eventContext.registerFrameHandler(10, () => {
                control.enablePerfCounter("physics")
                const dt = this.eventContext.deltaTime;
                this.physicsEngine.move(dt);
            })
            // user update 20
            // apply collisions 30
            this.eventContext.registerFrameHandler(30, () => {
                control.enablePerfCounter("collisions")
                const dt = this.eventContext.deltaTime;
                this.physicsEngine.collisions();
                this.camera.update();
                for (const s of this.allSprites)
                    s.__update(this.camera, dt);
            })
            // render background 60
            this.eventContext.registerFrameHandler(60, () => {
                control.enablePerfCounter("render background")
                this.background.render();
            })
            // paint 75
            // render sprites 90
            this.eventContext.registerFrameHandler(90, () => {
                control.enablePerfCounter("sprite_draw")
                if (this.flags & Flag.NeedsSorting)
                this.allSprites.sort(function (a, b) { return a.z - b.z || a.id - b.id; })
                for (const s of this.allSprites)
                    s.__draw(this.camera);
            })
            // render diagnostics
            this.eventContext.registerFrameHandler(150, () => {
                if (game.debug)
                    this.physicsEngine.draw();
                // clear flags
                this.flags = 0;
            });
            // update screen
            this.eventContext.registerFrameHandler(200, control.__screen.update);
        }

        addSprite(sprite: SpriteLike) {
            this.allSprites.push(sprite);
            sprite.id = this.spriteNextId++;
        }
    }
}

namespace sprites {
    export class SpriteHandler {
        public type: number;
        public handler: (sprite: Sprite) => void;
        
        public constructor(type: number, handler: (sprite: Sprite) => void) {
            this.type = type;
            this.handler = handler;
        }
    }

    export class OverlapHandler {
        public type: number;
        public otherType: number;
        public handler: (sprite: Sprite, otherSprite: Sprite) => void;

        public constructor(type: number, otherType: number, handler: (sprite: Sprite, otherSprite: Sprite) => void) {
            this.type = type;
            this.otherType = otherType;
            this.handler = handler;
        }
    }
}