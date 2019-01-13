namespace menu.state {
    export class State {
        root: Node;
        focus: Component;
        focusStack: Component[];
        updatingNodes: menu.animation.Updater[];

        constructor(root: Node) {
            this.root = root;
            this.focus = undefined;
            this.focusStack = [];
            this.updatingNodes = [];

            let lastTime = control.millis();
            game.onUpdate(() => {
                let time = control.millis();
                const delta = time - lastTime;

                /**
                 * as any member of this.updatingNodes could implement n.update such that it
                 * changes the subscribed elements (i.e. unsubscribes itself / subscribes something else),
                 * a clone needs to be made to guarantee the foreach
                 *    * doesn't miss an element's update
                 *    * doesn't attempt to update an index that no longer contains an element
                 */
                this.updatingNodes
                    .slice(0, this.updatingNodes.length)
                    .forEach((n) => n.update(delta));
                lastTime = time;
            })

            game.onPaint(() => {
                this.root.draw(screen, new menu.BoundingBox(0, 0, screen.width, screen.height));
            });

            controller.A.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.A))
            controller.B.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.B))
            controller.up.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.Up))
            controller.right.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.Right))
            controller.down.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.Down))
            controller.left.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.Left))
        }
    }

    /**
     * Sets the root node of the UI
     *
     * @param node The Node to make the UI root
     */
    export function setRoot(node: Node) {
        log('set root');
        game.pushScene();
        setMenuState(new menu.state.State(node));
    }

    function inputHandler(button: ButtonId): () => void {
        return () => {
            const scene = game.currentScene();
            if (!scene) return;
            const state = getMenuState();
            if (state && state.focus) {
                let node: Node = state.focus;

                // bubble up
                while (node) {
                    if (node instanceof Component)
                        (<Component>node).handleInput(button);
                    node = node.parent;
                }
            }
        }
    }

    export function subscribe(node: menu.animation.Updater) {
        const state = getMenuState();
        if (!state) return;
        
        state.updatingNodes.push(node);
    }

    export function unsubscribe(node: menu.animation.Updater) {
        const state = getMenuState();
        if (!state) return;
        state.updatingNodes.removeElement(node);
    }

    export function disposeComponent(c: menu.Component) {
        const state = getMenuState();
        if (!state) return;

        if (state.focus === c) {
            state.focus = undefined;
            state.focusStack.pop();
            menu.state.popFocus();
        }
        state.focusStack.removeElement(c);
    }

    /**
     * Pushes a component on top of the focus stack. The currently focused
     * component receives all button events until it is unfocused.
     */
    export function focus(c: Component, clearStack = false) {
        log(`focus`)
        const state = getMenuState();
        if (!state) return;
        if (state.focus) {
            state.focus.onBlur();
            state.focus = undefined;
        }
        if (c) {
            log(`focusing`)
            state.focus = c;
            state.focusStack.push(c);
            c.onFocus();
        }

        if (clearStack)
            state.focusStack = state.focus ? [state.focus] : [];
    }

    /**
     * Removes the currently focused component from the focus stack
     * and returns focus to the next component.
     */
    export function popFocus() {
        const state = getMenuState();
        if (!state) return;
        if (state.focus) {
            state.focus.onBlur();
            state.focus = undefined;
            state.focusStack.pop();
        }

        if (state.focusStack.length) {
            focus(state.focusStack.pop());
        }
    }

    export function getMenuState(): menu.state.State {
        const scene = game.currentScene();
        const data = scene.data();
        return data.menuState as menu.state.State;
    }

    export function setMenuState(state: menu.state.State) {
        const scene = game.currentScene();
        const data = scene.data();
        data.menuState = state;
    }
}