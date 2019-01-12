namespace menu.node {

    /**
     * A Node that simply constrains its children
     */
    export class Bounds extends Node {
        constructor(width: number, height: number) {
            super();
            this.fixedWidth = width;
            this.fixedHeight = height;
        }
    }

    /**
     * A Node that prints text
     */
    export class TextNode extends Node {
        protected font: image.Font;
        protected content: string;
        protected color: number;

        /**
         * Creates a TextNode
         *
         * @param font The font for the text
         * @param content The text to print
         * @param color The color index to use when printing the text
         */
        constructor(font: image.Font, content: string, color: number) {
            super();
            this.font = font;
            this.content = content;
            this.color = color;

            this.fixedWidth = this.content.length * font.charWidth - 1;
            this.fixedHeight = font.charHeight;
        }

        drawSelf(canvas: Image, bb: menu.BoundingBox) {
            canvas.print(
                this.content,
                this._bounds.originX | 0,
                this._bounds.originY | 0,
                this.color,
                this.font)
        }
    }

    /**
     * A simple rectangle node with a single color
     */
    export class RectNode extends Node {
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