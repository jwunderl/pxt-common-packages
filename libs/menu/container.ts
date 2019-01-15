namespace menu.node {

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
     * A Container that lays out its children in a vertical flow.
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
     * A Container that lays out its children in a horizontal flow.
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
}