import { router } from "@inertiajs/react";
import { Box, Spinner } from "grommet";
import { useEffect } from "react";

const LoadingPage = () => {
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.visit("/login", {
                replace: true,
            });
        }, 3000);

        return () => clearTimeout(timeoutId)
    }, []);

    return (
        <Box height={"100dvh"} justify="center" align="center">
            <Spinner size="large" />
        </Box>
    );
};

export default LoadingPage;
