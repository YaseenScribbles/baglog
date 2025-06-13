import { useForm } from "@inertiajs/react";
import {
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Heading,
    ResponsiveContext,
    Text,
    TextInput,
    Notification,
} from "grommet";
import { Login as LoginIcon, Shop } from "grommet-icons";
import { useContext, useEffect, useState } from "react";

const Login = (props) => {
    const { data, setData, post, processing } = useForm({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const login = () => {
        post("/login", {
            replace: true,
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const size = useContext(ResponsiveContext);

    useEffect(() => {
        if (props.message) {
            setMessage(props.message);
        }
    }, [props]);

    return (
        <Box height={"100dvh"} justify="center" align="center">
            <Card
                height={size === "large" ? "50%" : "60%"}
                width="medium"
                elevation="large"
            >
                <CardHeader pad="small">
                    <Box
                        direction="row"
                        align="center"
                        justify="center"
                        width={"100%"}
                        className="app-name"
                    >
                        <Heading
                            level={"2"}
                            color={"accent-1"}
                            margin={{ right: "small" }}
                        >
                            BAG
                        </Heading>
                        <Box className="logo">
                            <Shop color="accent-1" size="large" />
                        </Box>
                        <Heading
                            level={"2"}
                            color={"accent-1"}
                            margin={{ left: "small" }}
                        >
                            LOG
                        </Heading>
                    </Box>
                </CardHeader>
                <CardBody pad="medium">
                    <Box gap={"medium"}>
                        <TextInput
                            type="email"
                            placeholder="Enter Email"
                            value={data.email}
                            onChange={(event) =>
                                setData((p) => ({
                                    ...p,
                                    email: event.target.value,
                                }))
                            }
                        />
                        <TextInput
                            type="password"
                            placeholder="Enter Password"
                            value={data.password}
                            onChange={(event) =>
                                setData((p) => ({
                                    ...p,
                                    password: event.target.value,
                                }))
                            }
                        />
                        <Button
                            label="Login"
                            icon={<LoginIcon />}
                            pad={"small"}
                            hoverIndicator
                            onClick={login}
                            disabled={processing}
                        />
                    </Box>
                </CardBody>
                <CardFooter pad="medium">
                    <Box
                        align="center"
                        justify="center"
                        width={"100%"}
                        gap={"small"}
                    >
                        <Text size="small" textAlign="center" width="100%">
                            ESSA GARMENTS PRIVATE LIMITED
                        </Text>
                        <Text
                            size="small"
                            textAlign="center"
                            style={{ width: "100%" }}
                        >
                            COPYRIGHT &copy; {new Date().getFullYear()}
                        </Text>
                    </Box>
                </CardFooter>
            </Card>
            {message && (
                <Notification
                    title="BAGLOG"
                    message={message}
                    toast={{
                        autoClose: true,
                        position: "top-right",
                    }}
                    status="info"
                    icon={<Shop color="accent-1" />}
                    onClose={() => setMessage("")}
                    time={2000}
                />
            )}
        </Box>
    );
};

export default Login;
