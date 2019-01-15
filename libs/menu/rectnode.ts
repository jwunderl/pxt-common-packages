namespace menu.node {
    /**
     * A simple rectangle node with a single color
     */
    export class RectNode extends menu.Node {
        color: number;

        /**
         * Creates a RectNode
         *
         * @param color The color to draw the rectangle with
         */
        constructor(color: number) {
            super();
            this.color = color;
        }

        drawSelf(canvas: Image, bb: menu.BoundingBox) {
            canvas.fillRect(
                this._bounds.originX | 0,
                this._bounds.originY | 0,
                this.width | 0,
                this.height | 0,
                this.color);
        }
    }
}