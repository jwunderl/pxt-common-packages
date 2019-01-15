namespace menu {
    /**
     * A Node in the UI tree with dimensions
     */
    export class Node {
        protected _top: number;
        protected _left: number;
        protected _bounds: menu.BoundingBox;
        protected dirty: boolean;

        fixedWidth: number;
        fixedHeight: number;

        parent: Node;
        children: Node[];

        constructor() {
            this.dirty = true;
            this._top = 0;
            this._left = 0;
        }

        /**
         * The current width of the Node
         */
        get width() {
            return this.fixedWidth || (this._bounds && this._bounds.width)
        }

        /**
         * The current height of the Node
         */
        get height() {
            return this.fixedHeight || (this._bounds && this._bounds.height)
        }

        get top() {
            return this._top;
        }

        set top(t: number) {
            if (t === this.top) return;
            this._top = t;
            this.notifyChange();
        }

        get left() {
            return this._left
        }

        set left(l: number) {
            if (l === this.left) return;
            this._left = l;
            this.notifyChange();
        }

        get bottom() {
            return this._top + this.fixedHeight;
        }

        set bottom(b: number) {
            if (b === this.bottom) return;
            this._top = b - this.fixedHeight;
            this.notifyChange();
        }

        get right() {
            return this._left + this.fixedWidth;
        }

        set right(r: number) {
            if (r === this.right) return;
            this._left = r - this.fixedWidth;
            this.notifyChange();
        }

        draw(canvas: Image, available: menu.BoundingBox) {
            this._bounds = this.getBounds(available);

            this.drawSelf(canvas, available);
            this.drawChildren(canvas, this._bounds);
            this.dirty = false;
        }

        /**
         * Draws the component within the available bounds
         *
         * @param canvas The image to draw the component on
         * @param available The available bounds in which the component will be drawn
         */
        drawSelf(canvas: Image, available: menu.BoundingBox) {
            // Subclass
        }

        /**
         * Draws the children of the component within the available bounds
         *
         * @param canvas The image to draw the children on
         * @param available The available bounds in which the children will be drawn
         */
        drawChildren(canvas: Image, available: menu.BoundingBox) {
            if (this.children) {
                for (let i = 0; i < this.children.length; i++) {
                    this.children[i].draw(canvas, available);
                }
            }
        }

        /**
         * Adds a child to this node
         *
         * @param n The Node to add
         */
        appendChild(n: Node) {
            if (!this.children) this.children = [];
            n.parent = this;
            this.children.push(n);
            this.notifyChange();
        }

        /**
         * Triggers a redraw of this Node (and possibly its parent in the tree)
         */
        notifyChange() {
            if (this.dirty) return; // don't double notify
            this.dirty = true;
            if (this.parent) {
                log(`childchanged`)
                this.parent.onChildDidChange(this);
            }
        }

        onChildDidChange(child: Node) {
            if (this.dirty) return; // don't double notify
            this.dirty = true;
            if (this.shouldBubbleChange(child)) {
                this.notifyChange();
            }
        }

        shouldBubbleChange(childThatUpdated: Node) {
            return !!this.parent;
        }

        update(dt: number) {
            // subclasses need to subscribe
        }

        /**
         * Disposes of the Node and its children
         */
        dispose() {
            const state = menu.state.getMenuState();
            if (!state) return;

            if (state.root == this) {
                game.popScene();
            }

            this.children.forEach(c => c.dispose());
            this.children = undefined;
        }

        /**
         * Gets the bounds for the children of this node
         *
         * @param bb The bounds passed to this node (e.g. from its parent)
         * @return The bounds available to children of this node
         */
        getBounds(bb: menu.BoundingBox) {
            if (this.fixedWidth || this.fixedHeight || this.left || this.top) {
                return new menu.BoundingBox(
                    bb.originX + this.left,
                    bb.originY + this.top,
                    this.fixedWidth || bb.width,
                    this.fixedHeight || bb.height);
            }
            return bb;
        }

        /**
         * Creates a linear timed Animation for this node
         *
         * @param cb The callback that the Animation will call on this node
         */
        animate(cb: (node: Node, value: number) => void) {
            return new menu.animation.Animation(this, cb);
        }
    }

    export function setWidth(node: menu.Node, value: number) {
        node.fixedWidth = value;
    }

    export function setHeight(node: menu.Node, value: number) {
        node.fixedHeight = value;
    }
}