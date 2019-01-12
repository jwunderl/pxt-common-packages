namespace menu {
    /**
     * A Node that justifies its children Node within its bounds. Should
     * only be used with Nodes that have a fixed width/height
     */
    export class JustifiedContent extends Node {
        xAlign: Alignment;
        yAlign: Alignment;

        /**
         * Creates a JustifiedContent Node
         *
         * @param content The child node to justify
         * @param xAlignment The alignment along the X-Axis
         * @param yAlignment The alignment along the Y-Axis
         */
        constructor(content: Node, xAlignment: Alignment, yAlignment: Alignment) {
            super();

            this.xAlign = xAlignment;
            this.yAlign = yAlignment;

            this.appendChild(content);
        }

        drawChildren(canvas: Image, bb: menu.BoundingBox) {
            this.moveChild();
            super.drawChildren(canvas, bb);
        }

        protected moveChild() {
            const content = this.children[0];

            switch (this.xAlign) {
                case Alignment.Left:
                    content.left = 0;
                    break;
                case Alignment.Right:
                    content.left = this.width - content.width;
                    break;
                case Alignment.Center:
                    content.left = ((this.width - content.width) / 2);
                    break;
            }

            switch (this.yAlign) {
                case Alignment.Top:
                    content.top = 0;
                    break;
                case Alignment.Bottom:
                    content.top = this.height - content.height;
                    break;
                case Alignment.Center:
                    content.top = ((this.height - content.height) / 2);
                    break;
            }
        }
    }
}