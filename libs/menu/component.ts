namespace menu {

    /**
     * A Node that can receive input
     */
    export class Component extends Node {
        visible: boolean;

        constructor() {
            super();
            this.visible = false;
        }

        draw(canvas: Image, available: menu.BoundingBox) {
            if (this.visible) super.draw(canvas, available);
            this.dirty = false;
        }

        show() {
            if (this.visible) return;
            this.visible = true;
            this.onShown();
            this.notifyChange();
        }

        hide() {
            if (!this.visible) return;
            this.visible = false;
            this.onHidden();
            this.notifyChange();
        }

        onShown() {

        }

        onHidden() {

        }

        onFocus() {

        }

        onBlur() {

        }

        handleInput(button: number): boolean {
            return true;
        }

        dispose() {
            super.dispose();
            menu.state.disposeComponent(this);
        }
    }
}