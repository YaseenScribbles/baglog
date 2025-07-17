import { router, useForm } from "@inertiajs/react";
import {
    Box,
    Grid,
    Heading,
    FormField,
    TextInput,
    Button,
    Table,
    TableHeader,
    TableRow,
    TableCell,
    TableBody,
    Notification,
    Spinner,
    Select,
    ResponsiveContext,
} from "grommet";
import MyHeader from "./Components/Header";
import { useContext, useState } from "react";
import { Edit, Trash, Shop } from "grommet-icons";

const Users = (props) => {
    const { data, setData, processing, post, put } = useForm({
        name: "",
        email: "",
        password: "",
        role: "",
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const [users, setUsers] = useState(props.users);
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");
    const size = useContext(ResponsiveContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const reset = () => {
        setData({
            name: "",
            email: "",
            password: "",
            role: "",
        });
        setEditId(null);
    };

    const saveUser = () => {
        post("/users", {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.users) {
                    setUsers(page.props.users);
                }
                reset();
                setMessage("User saved successfully");
            },
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const updateUser = () => {
        put("/users/" + editId, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.users) {
                    setUsers(page.props.users);
                }
                reset();
                setMessage("User updated successfully");
            },
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const deleteUser = (id) => {
        router.delete("/users/" + id, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.users) {
                    setUsers(page.props.users);
                }
                setMessage("User deleted successfully");
            },
        });
    };

    return (
        <Box height={"100dvh"}>
            <MyHeader
                onHeightChange={setHeaderHeight}
                role={props.auth.user.role}
                name={props.auth.user.name}
            />
            {headerHeight > 0 && (
                <Grid
                    columns={["1/4", "3/4"]}
                    style={{
                        height: `calc(100% - ${headerHeight}px)`,
                    }}
                >
                    <Box
                        gap={"small"}
                        border={{ side: "right" }}
                        pad={"medium"}
                    >
                        <Heading level={3}>
                            {editId ? "Update User" : "Create User"}
                        </Heading>
                        <FormField name="name" htmlFor="name" label="Name">
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField name="email" htmlFor="email" label="Email">
                            <TextInput
                                id="email"
                                name="email"
                                value={data.email}
                                type="email"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField
                            name="password"
                            htmlFor="password"
                            label="Password"
                        >
                            <TextInput
                                id="password"
                                name="password"
                                type="password"
                                value={data.password ?? ""}
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField name="role" htmlFor="role" label="Role">
                            <Select
                                id="role"
                                name="role"
                                options={["admin", "manager", "user"]}
                                value={data.role}
                                onChange={handleChange}
                            />
                        </FormField>

                        <Box direction="row" gap="medium" justify="end">
                            <Button
                                type="button"
                                primary
                                label="Submit"
                                onClick={editId ? updateUser : saveUser}
                            />
                            <Button
                                type="reset"
                                label="Reset"
                                onClick={reset}
                            />
                        </Box>
                    </Box>
                    <Box gap={"small"} pad={"medium"}>
                        <Heading level={3}>Users</Heading>
                        <Box
                            width={"100%"}
                            overflow={{ vertical: "auto" }}
                            height={size === "large" ? "85%" : "80%"}
                        >
                            <Table>
                                <TableHeader
                                    style={{
                                        position: "sticky",
                                        top: "0",
                                        backgroundColor: "#000",
                                        zIndex: "1",
                                    }}
                                >
                                    <TableRow>
                                        <TableCell scope="col" border="bottom">
                                            Name
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            Email
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            Role
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length > 0 &&
                                        users.map((user, index) => (
                                            <TableRow key={index}>
                                                <TableCell scope="row">
                                                    <strong>{user.name}</strong>
                                                </TableCell>
                                                <TableCell>
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    {user.role}
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        direction="row"
                                                        gap={"xxsmall"}
                                                    >
                                                        <Button
                                                            icon={
                                                                <Edit color="accent-1" />
                                                            }
                                                            hoverIndicator
                                                            onClick={() => {
                                                                setEditId(
                                                                    user.id
                                                                );
                                                                setData({
                                                                    name: user.name,
                                                                    email: user.email,
                                                                    role: user.role,
                                                                    password:
                                                                        "",
                                                                });
                                                            }}
                                                        />
                                                        <Button
                                                            icon={
                                                                <Trash color="accent-1" />
                                                            }
                                                            hoverIndicator
                                                            onClick={() => {
                                                                if (
                                                                    window.confirm(
                                                                        "Are you sure?"
                                                                    )
                                                                ) {
                                                                    deleteUser(
                                                                        user.id
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    {processing && (
                                        <TableRow>
                                            <TableCell
                                                scope="row"
                                                colSpan={5}
                                                justify="center"
                                                align="center"
                                            >
                                                <Spinner color={"accent-1"} />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                        {message && (
                            <Notification
                                title="BAGLOG"
                                message={message}
                                toast={{
                                    autoClose: true,
                                    position: "bottom-right",
                                }}
                                status="info"
                                icon={<Shop color="accent-1" />}
                                onClose={() => setMessage("")}
                                time={3000}
                            />
                        )}
                    </Box>
                </Grid>
            )}
        </Box>
    );
};

export default Users;
