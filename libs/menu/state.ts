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
                this.updatingNodes.forEach(n => { 
                    if (n) {
                        n.update(delta)
                    } else {
                        // todo: At some point, this.updatingNodes contains undefined. debug why
                        // ?? Potentially error with Array.removeElement or gc ?? particles also have the issue
                        // where at no point the value undefined seems to be added, but it occasionally does
                        console.log("DEBUG ME" + this.updatingNodes.length);
                    }
                });
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

    export function subscribe(node: menu.animation.Updater) {
        const state = getMenuState();
        if (!state) return;

        // debugging issue above? never triggers true...
        // if (state.updatingNodes.some(a => a == undefined)) console.log("c")
        state.updatingNodes.push(node);
        // if (state.updatingNodes.some(a => a == undefined)) console.log("d")
    }

    export function unsubscribe(node: menu.animation.Updater) {
        const state = getMenuState();
        if (!state) return;
        // debugging issue above? never triggers true...
        // if (state.updatingNodes.some(a => a == undefined)) console.log("a")
        state.updatingNodes.removeElement(node);
        // if (state.updatingNodes.some(a => a == undefined)) console.log("b")
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