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
            "neutral-8": {
                dark: "#6D4C41", // deep earthy brown
                light: "#6D4C41",
            },
            "neutral-9": {
                dark: "#2F3E46", // dark slate / blue-gray
                light: "#2F3E46",
            },
            "neutral-10": {
                dark: "#1B1B1B", // near-black neutral
                light: "#1B1B1B",
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
            </Grommet>,
        );
    },
});
