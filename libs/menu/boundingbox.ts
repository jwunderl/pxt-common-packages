namespace menu {
    /**
     * A rectangle that represents the bounds of an element
     */
    export class BoundingBox {
        originX: number;
        originY: number;
        width: number;
        height: number;

        /**
         * Creates a BoundingBox
         *
         * @param ox The left edge of the bounds
         * @param oy The top edge of the bounds
         * @param width The width of the bounds
         * @param height The height of the bounds
         */
        constructor(ox: number, oy: number, width: number, height: number) {
            this.originX = ox;
            this.originY = oy;
            this.width = width;
            this.height = height;
        }
    }
}