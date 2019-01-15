namespace menu.node {
    /**
     * A Node that simply constrains its children
     */
    export class Bounds extends menu.Node {
        constructor(width: number, height: number) {
            super();
            this.fixedWidth = width;
            this.fixedHeight = height;
        }
    }
}