declare global {
    interface KeysMp {
        /**
         * Bind a key with an enforced cooldown to prevent spam.
         *
         * @param key Hex code of the key to bind.
         * @param hold Trigger on key down (`true`) or key up (`false`).
         * @param cooldown Cooldown in milliseconds between handler executions.
         * @param handler Function invoked when the cooldown has passed.
         */
        bindSpam(key: number, hold: boolean, cooldown: number, handler: () => void): void;
    }
}

export {};
