import { router } from "@inertiajs/react";
import { Anchor, Box, Header, Heading, Menu, Nav, Text } from "grommet";
import {
    Shop,
    Dashboard,
    Catalog,
    Deliver,
    Logout,
    Clipboard,
    UserManager,
    Nodes,
    User,
} from "grommet-icons";
import { useEffect, useRef } from "react";

const MyHeader = ({ onHeightChange, role, name = "Yaseen" }) => {
    const headerRef = useRef();

    useEffect(() => {
        if (headerRef.current) {
            const height = headerRef.current.offsetHeight;
            onHeightChange?.(height);
        }
    }, []);

    return (
        <Header
            ref={headerRef}
            background="brand"
            pad={{ vertical: "xxsmall", horizontal: "medium" }}
            gap={"small"}
        >
            <Box
                direction="row"
                align="center"
                justify="center"
                className="app-name"
            >
                <Heading
                    margin={{ right: "small" }}
                    size="xsmall"
                    level={"2"}
                    color={"accent-1"}
                >
                    BAG
                </Heading>
                <Box className="logo">
                    <Shop color="accent-1" size="medium" className="logo" />
                </Box>
                <Heading
                    margin={{ left: "small" }}
                    size="xsmall"
                    level={"2"}
                    color={"accent-1"}
                >
                    LOG
                </Heading>
            </Box>
            <Nav direction="row" pad={"small"} gap={"medium"}>
                <Anchor
                    onClick={() => {
                        router.visit("/dashboard");
                    }}
                    href="#"
                    label="Dashboard"
                    icon={<Dashboard />}
                    hoverIndicator
                />
                {role === "admin" && (
                    <Anchor
                        onClick={() => {
                            router.visit("/users");
                        }}
                        href="#"
                        label="Users"
                        icon={<UserManager />}
                        hoverIndicator
                    />
                )}
                {role !== "user" && (
                    <Anchor
                        onClick={() => {
                            router.visit("/stations");
                        }}
                        href="#"
                        label="Stations"
                        icon={<Nodes />}
                        hoverIndicator
                    />
                )}
                <Anchor
                    onClick={() => {
                        router.visit("/products");
                    }}
                    href="#"
                    label="Products"
                    icon={<Catalog />}
                    hoverIndicator
                />
                {role !== "user" && (
                    <Anchor
                        onClick={() => router.visit("/receipts")}
                        href="#"
                        label="Receipt"
                        icon={<Clipboard />}
                        hoverIndicator
                    />
                )}
                <Anchor
                    onClick={() => router.visit("/deliveries")}
                    href="#"
                    label="Delivery"
                    icon={<Deliver />}
                    hoverIndicator
                />
                <Menu
                    label={<Text color="accent-1">{`Hi, ${name}`}</Text>}
                    items={[
                        {
                            label: "Logout",
                            onClick: () => {
                                router.post(
                                    "/logout",
                                    {},
                                    {
                                        replace: true,
                                    }
                                );
                            },
                            icon: <Logout />,
                            gap: "small",
                        },
                    ]}
                />
                {/* <Anchor
                    onClick={() => {
                        router.post(
                            "/logout",
                            {},
                            {
                                replace: true,
                            }
                        );
                    }}
                    href="#"
                    label="Logout"
                    icon={<Logout />}
                    color={"focus"}
                /> */}
            </Nav>
        </Header>
    );
};

export default MyHeader;
