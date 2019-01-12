namespace menu.animation {
    export interface Updater {
        update(dt: number): void;
    }

    /**
     * An animation that periodically calls a callback with a linear
     * timing function
     */
    export class Animation implements Updater {
        target: menu.Node;
        cb: (node: menu.Node, value: number) => void;
        running: boolean;
        startValue: number;
        endValue: number;
        elapsed: number;
        period: number;
        next: Animation;
        endedHandler: () => void;

        /**
         * Creates a linear timed Animation
         *
         * @param target The node to animate
         * @param cb The animation function
         */
        constructor(target: menu.Node, cb: (node: menu.Node, value: number) => void) {
            this.target = target;
            this.elapsed = 0;
            this.cb = cb;
        }

        /**
         * Sets the start value for the linear timing function
         *
         * @param start The start value to animate from
         * @return the Animation
         */
        from(start: number) {
            this.startValue = start;
            return this;
        }

        /**
         * Sets the end value for the linear timing function
         *
         * @param end The end value to end the animation at
         * @return the Animation
         */
        to(end: number) {
            this.endValue = end;
            return this;
        }

        /**
         * Sets the duration for the linear timing function
         *
         * @param period The duration of the animation in milliseconds
         * @return the Animation
         */
        duration(period: number) {
            this.period = period;
            return this;
        }

        /**
         * Sets an animation to run after this animation completes. Only
         * one animation can be registered to run after
         *
         * @param next The next animation to run
         * @return the Animation
         */
        chain(next: Animation) {
            this.next = next;
            return this;
        }

        /**
         * Registers a handler to run when the animation is completed (stoppied)
         * @param handler 
         */
        onEnded(handler: () => void) {
            this.endedHandler = handler;
            return this;
        }

        /**
         * Starts the animation for a single run
         */
        start() {
            if (this.running) return;
            this.running = true;
            menu.state.subscribe(this);
        }

        /**
         * Starts the animation in a loop
         */
        loop() {
            this.chain(this);
            this.start();
        }

        /**
         * Stops the execution of the animation
         */
        stop() {
            this.running = false;
            this.elapsed = 0;
            menu.state.unsubscribe(this);
            if (this.endedHandler)
                this.endedHandler();
        }

        update(dt: number) {
            if (!this.running) return;
            this.elapsed += dt;

            if (this.cb) {
                let value = this.startValue + (((this.endValue - this.startValue) / this.period) * this.elapsed) | 0;

                if (this.startValue > this.endValue) {
                    value = Math.max(this.endValue, value);
                }
                else {
                    value = Math.min(this.endValue, value);
                }

                this.cb(this.target, value);
                this.target.notifyChange();
            }

            if (this.elapsed > this.period) {
                this.stop();
                if (this.next) {
                    this.next.start();
                }
            }
        }
    }
}