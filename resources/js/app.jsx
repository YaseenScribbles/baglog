// import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { Grommet, grommet } from "grommet";
import { deepMerge } from "grommet/utils";

const customTheme = deepMerge(grommet, {
    notification: {
        toast: {
            container: {
                pad: { horizontal: "small", vertical: "small" },
            },
        },
    },
    global: {
        colors: {
            "neutral-0": {
                dark: "#C27B00",
                light: "#C27B00",
            },
            "neutral-5": {
                dark: "#009E67",
                light: "#009E67",
            },
            "neutral-6": {
                dark: "#023047",
                light: "#023047",
            },
            "neutral-7": {
                dark: "#3a5a40",
                light: "#3a5a40",
            },
        },
    },
});

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <Grommet theme={customTheme} themeMode="dark" full>
                <App {...props} />
            </Grommet>
        );
    },
});
