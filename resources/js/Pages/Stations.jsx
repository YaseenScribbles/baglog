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

const Stations = (props) => {
    const { data, setData, processing, post, put } = useForm({
        name: "",
        type: "",
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const [stations, setStations] = useState(props.stations);
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");
    const size = useContext(ResponsiveContext);

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "name") {
            value = value.toUpperCase();
        }

        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const reset = () => {
        setData({
            name: "",
            type: "",
        });
        setEditId(null);
    };

    const saveStation = () => {
        post("/stations", {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.stations) {
                    setStations(page.props.stations);
                }
                reset();
                setMessage("Station saved successfully");
            },
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const updateStation = () => {
        put("/stations/" + editId, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.stations) {
                    setStations(page.props.stations);
                }
                reset();
                setMessage("Station updated successfully");
            },
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const deleteStation = (id) => {
        router.delete("/stations/" + id, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.stations) {
                    setStations(page.props.stations);
                }
                setMessage("Station deleted successfully");
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
                            {editId ? "Update Station" : "Create Station"}
                        </Heading>
                        <FormField name="name" htmlFor="name" label="Name">
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name.toUpperCase()}
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField name="type" htmlFor="type" label="Type">
                            <Select
                                id="type"
                                name="type"
                                options={["floor", "customer"]}
                                value={data.type}
                                onChange={handleChange}
                            />
                        </FormField>
                        <Box direction="row" gap="medium" justify="end">
                            <Button
                                type="button"
                                primary
                                label="Submit"
                                onClick={editId ? updateStation : saveStation}
                                disabled={processing}
                            />
                            <Button
                                type="reset"
                                label="Reset"
                                onClick={reset}
                            />
                        </Box>
                    </Box>
                    <Box gap={"small"} pad={"medium"}>
                        <Heading level={3}>Stations</Heading>
                        <Box
                            width={"100%"}
                            overflow={{ vertical: "auto" }}
                            height={size === "large" ? "85%" : "80%"}
                            flex="grow"
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
                                            Type
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            Created By
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stations.length > 0 &&
                                        stations.map((station, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {station.name}
                                                </TableCell>
                                                <TableCell>
                                                    {station.type}
                                                </TableCell>
                                                <TableCell>
                                                    {station.created_by}
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        direction="row"
                                                        gap={"xxsmall"}
                                                    >
                                                        {props.auth.user
                                                            .role !==
                                                            "user" && (
                                                            <Button
                                                                icon={
                                                                    <Edit color="accent-1" />
                                                                }
                                                                hoverIndicator
                                                                onClick={() => {
                                                                    setEditId(
                                                                        station.id
                                                                    );
                                                                    setData({
                                                                        name: station.name,
                                                                        type: station.type,
                                                                    });
                                                                }}
                                                            />
                                                        )}
                                                        {props.auth.user
                                                            .role ===
                                                            "admin" && (
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
                                                                        deleteStation(
                                                                            station.id
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        )}
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

export default Stations;
