namespace menu.node {
    /**
     * A Node that prints text
     */
    export class TextNode extends menu.Node {
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
}