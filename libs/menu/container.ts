namespace menu.container {

    /**
     * A Node that caches its content to an Image. Useful for nodes that
     * have complex (but mostly static) child trees
     */
    export class Container extends Node {
        image: Image;

        constructor(width: number, height: number) {
            super();
            width = width | 0;
            height = height | 0;
            this.fixedWidth = width;
            this.fixedHeight = height;
            this.image = image.create(width, height);
        }

        draw(canvas: Image, bb: menu.BoundingBox) {
            if (this.dirty) {
                this._bounds = this.getBounds(bb);
                this.drawSelf(this.image, bb);
                this.drawChildren(this.image, new menu.BoundingBox(0, 0, this.fixedWidth, this.fixedHeight));
            }
            canvas.drawTransparentImage(this.image, this._bounds.originX | 0, this._bounds.originY | 0);
            this.dirty = false;
        }

        shouldBubbleChange(childThatUpdated: Node) {
            return true;
        }
    }

    /**
     * A Container that lays out its children in a vertical flow. Children
     * are given bounds of equal height
     */
    export class VerticalFlow extends Container {
        drawChildren(canvas: Image, available: menu.BoundingBox) {
            if (this.children) {
                let yOffset = 0;
                for (let i = 0; i < this.children.length; i++) {
                    const c = this.children[i];
                    const bb = new menu.BoundingBox(available.originX, yOffset, this.width, c.height);
                    c.draw(canvas, bb);
                    yOffset += c.height;
                }
            }
        }
    }

    /**
     * A Container that lays out its children in a horizontal flow. Children
     * are given bounds of equal width
     */
    export class HorizontalFlow extends Container {
        drawChildren(canvas: Image, available: menu.BoundingBox) {
            if (this.children) {
                let xOffset = 0;
                for (let i = 0; i < this.children.length; i++) {
                    const c = this.children[i];
                    const bb = new menu.BoundingBox(xOffset, available.originY, c.width, this.height);
                    c.draw(canvas, bb);
                    xOffset += c.width;
                }
            }
        }
    }
    export class Label extends Container {
        fullString: string;
        font: image.Font;
        color: number;
        text: menu.node.TextNode;

        constructor(width: number, font: image.Font, content: string) {
            super(width, font.charHeight);
            this.fullString = content;
            this.font = font;

            this.text = new menu.node.TextNode(this.font, content, 1);
            this.appendChild(this.text);
        }
    }

    /**
     * A label that scrolls its content in a loop
     */
    export class ScrollingLabel extends Label {
        pause: number;
        speed: number;
        timer: number;

        maxOffset: number;

        private _scrolling: boolean;
        private _offset: number;

        get scrolling() {
            return this._scrolling;
        }

        set scrolling(v: boolean) {
            if (v === this._scrolling) return;
            this._scrolling = v;
            this.timer = this.pause;

            if (this.offset !== 0) {
                this.offset = 0;
                this.notifyChange();
            }
        }

        get offset() {
            return this._offset;
        }

        set offset(o: number) {
            this._offset = 0;
            this.text.left = -(o | 0);
        }

        constructor(width: number, font: image.Font, content: string) {
            super(width, font, content);
            this.pause = 750;
            this.speed = 1 / 100;
            this.offset = 0;
            this.timer = this.pause;
            this.scrolling = false;

            this.maxOffset = content.length * this.font.charWidth - this.width;

            if (this.maxOffset > 0)
                menu.state.subscribe(this);
        }

        update(dt: number) {
            if (this.width <= this.maxOffset) {
                return;
            }

            if (this.timer > 0) {
                this.timer -= dt;

                if (this.timer <= 0 && this.offset) {
                    this.offset = 0;
                    this.timer = this.pause;
                }
            }
            else {
                this.offset += dt * this.speed;

                if (this.offset > this.maxOffset) {
                    this.offset = this.maxOffset;
                    this.timer = this.pause;
                }

                this.notifyChange();
            }
        }

        dispose() {
            super.dispose();
            menu.state.unsubscribe(this);
        }
    }

}