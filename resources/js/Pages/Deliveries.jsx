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
    Text,
    ResponsiveContext,
    TableFooter,
    DateInput,
    DataTable,
    Data,
    Toolbar,
} from "grommet";
import MyHeader from "./Components/Header";
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { Trash, Shop, Add, Edit, Download } from "grommet-icons";
import axios from "axios";
import { format } from "date-fns";
import { excelExport } from "./Common/common";

const reducer = (state, action) => {
    switch (action.type) {
        case "add":
            return [...state, action.payload];
        case "updateQty":
            const oldState = [...state];
            const elementToBeUpdated = oldState[action.payload.index];
            elementToBeUpdated.qty =
                +elementToBeUpdated.qty + +action.payload.qty;
            return oldState;
        case "remove":
            const newState = state.filter((s) => s.id != action.payload);
            return newState;
        case "clear":
            return [];
        default:
            return state;
    }
};

const Deliveries = (props) => {
    const { data, setData, processing, post, put } = useForm({
        from: "",
        to: "",
        total_qty: "",
        ref_no: "",
        delivery_items: [],
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const [deliveries, setDeliveries] = useState(props.deliveries);
    const [stations] = useState(props.stations);
    const [products] = useState(props.products);
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");
    const [items, dispatch] = useReducer(reducer, []);
    const [selectedProduct, setSelectedProduct] = useState({
        id: "",
        name: "",
        qty: "",
    });
    const [selectedFromStation, setSelectedFromStation] = useState(null);
    const [selectedToStation, setSelectedToStation] = useState(null);
    const productRef = useRef();
    const size = useContext(ResponsiveContext);
    const [loading, setLoading] = useState(false);
    const [currentStock, setCurrentStock] = useState(0);

    const reset = () => {
        setData({
            from: "",
            to: "",
            total_qty: "",
            ref_no: "",
            delivery_items: [],
        });
        setEditId(null);
        setSelectedFromStation(null);
        setSelectedToStation(null);
        setSelectedProduct({
            id: "",
            name: "",
            qty: "",
        });
        setCurrentStock(0);
        dispatch({
            type: "clear",
        });
    };

    const saveDelivery = () => {
        if (!data.from) {
            setMessage("Select from station first");
            return;
        }

        if (!data.to) {
            setMessage("Select to station first");
            return;
        }

        if (items.length === 0) {
            setMessage("No Data");
            return;
        }

        post("/deliveries", {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.deliveries) {
                    setDeliveries(page.props.deliveries);
                }
                reset();
                setMessage("Delivery saved successfully");
            },
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const updateDelivery = () => {
        if (!data.from) {
            setMessage("Select from station first");
            return;
        }

        if (!data.to) {
            setMessage("Select to station first");
            return;
        }

        if (items.length === 0) {
            setMessage("No Data");
            return;
        }

        put("/deliveries/" + editId, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.deliveries) {
                    setDeliveries(page.props.deliveries);
                }
                reset();
                setMessage("Delivery updated successfully");
            },
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const deleteDelivery = (id) => {
        router.delete("/deliveries/" + id, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.deliveries) {
                    setDeliveries(page.props.deliveries);
                }
                setMessage("Delivery deleted successfully");
            },
        });
    };

    useEffect(() => {
        if (selectedFromStation) {
            setData((prev) => ({
                ...prev,
                from: selectedFromStation.id,
            }));
        }

        if (selectedToStation) {
            setData((prev) => ({
                ...prev,
                to: selectedToStation.id,
            }));
        }
    }, [selectedFromStation, selectedToStation]);

    useEffect(() => {
        const qty = items?.reduce((acc, curr) => acc + +curr.qty, 0);

        setData((prev) => ({
            ...prev,
            total_qty: qty,
            delivery_items: items.map((item) => ({
                product_id: item.id,
                qty: item.qty,
            })),
        }));
    }, [items]);

    useEffect(() => {
        if (selectedProduct.id) {
            axios
                .get(
                    `/deliverystock?station_id=${data.from}&product_id=${selectedProduct.id}`
                )
                .then(({ data }) => {
                    if (data.stock) {
                        setCurrentStock(+data.stock);
                    }
                })
                .catch((e) => console.log(e));
        }
    }, [selectedProduct.id]);

    return (
        <Box height={"100dvh"}>
            <MyHeader
                onHeightChange={setHeaderHeight}
                role={props.auth.user.role}
            />
            {headerHeight && (
                <Grid
                    columns={["1/3", "2/3"]}
                    style={{ height: `calc(100% - ${headerHeight}px)` }}
                >
                    <Box
                        gap={size === "large" ? "medium" : "xxsmall"}
                        border={{ side: "right" }}
                        pad={size === "large" ? "medium" : "small"}
                    >
                        {loading ? (
                            <Box
                                width={"100%"}
                                height={"100%"}
                                align="center"
                                justify="center"
                            >
                                <Spinner color={"accent-1"} />
                            </Box>
                        ) : (
                            <>
                                <Heading
                                    level={3}
                                    margin={{ vertical: "small" }}
                                >
                                    {editId
                                        ? "Update Delivery"
                                        : "Create Delivery"}
                                </Heading>
                                <Box direction="row" gap={"small"}>
                                    <Box basis="40%">
                                        <FormField
                                            name="from_station_id"
                                            htmlFor="from_station_id"
                                            label="From"
                                        >
                                            <Select
                                                id="from_station_id"
                                                name="from_station_id"
                                                options={stations}
                                                labelKey={"name"}
                                                valueKey={{
                                                    key: "id",
                                                    reduce: true,
                                                }}
                                                value={
                                                    selectedFromStation?.id ||
                                                    ""
                                                }
                                                onChange={(e) => {
                                                    setSelectedFromStation(
                                                        e.option
                                                    );
                                                }}
                                                size="small"
                                            />
                                        </FormField>
                                    </Box>
                                    <Box basis="40%">
                                        <FormField
                                            name="to_station_id"
                                            htmlFor="to_station_id"
                                            label="To"
                                        >
                                            <Select
                                                id="to_station_id"
                                                name="to_station_id"
                                                options={stations}
                                                labelKey={"name"}
                                                valueKey={{
                                                    key: "id",
                                                    reduce: true,
                                                }}
                                                value={
                                                    selectedToStation?.id || ""
                                                }
                                                onChange={(e) => {
                                                    setSelectedToStation(
                                                        e.option
                                                    );
                                                }}
                                                size="small"
                                            />
                                        </FormField>
                                    </Box>
                                    <Box basis="20%">
                                        <FormField
                                            name="ref_no"
                                            htmlFor="ref_no"
                                            label="Ref No"
                                        >
                                            <TextInput
                                                id="ref_no"
                                                name="ref_no"
                                                value={data.ref_no}
                                                onChange={(e) =>
                                                    setData((prev) => ({
                                                        ...prev,
                                                        ref_no: e.target.value,
                                                    }))
                                                }
                                                size="small"
                                            />
                                        </FormField>
                                    </Box>
                                </Box>
                                <Box
                                    direction="row"
                                    gap={"small"}
                                    border={{
                                        side: "bottom",
                                        color: "accent-1",
                                    }}
                                    pad={{ bottom: "medium" }}
                                    margin={{ bottom: "xsmall" }}
                                >
                                    <FormField
                                        name="product_id"
                                        htmlFor="product_id"
                                        label="Product"
                                        style={{ flexBasis: "80%" }}
                                    >
                                        <Select
                                            id="product_id"
                                            name="product_id"
                                            options={products}
                                            labelKey={"name"}
                                            valueKey={"id"}
                                            value={selectedProduct}
                                            onChange={(e) => {
                                                setSelectedProduct((prev) => ({
                                                    ...prev,
                                                    id: e.value.id,
                                                    name: e.value.name,
                                                }));
                                            }}
                                            size="small"
                                            ref={productRef}
                                            disabled={data.from === ""}
                                        />
                                    </FormField>
                                    <FormField
                                        name="qty"
                                        htmlFor="qty"
                                        label={`Qty(${currentStock})`}
                                    >
                                        <TextInput
                                            id="qty"
                                            name="qty"
                                            value={selectedProduct.qty}
                                            onChange={(e) => {
                                                const qty = e.target.value;
                                                if (isNaN(qty)) return;
                                                setSelectedProduct((prev) => ({
                                                    ...prev,
                                                    qty: e.target.value,
                                                }));
                                            }}
                                            size="small"
                                            disabled={data.from === ""}
                                        />
                                    </FormField>
                                    <Button
                                        disabled={data.from === ""}
                                        type="button"
                                        icon={<Add />}
                                        onClick={() => {
                                            if (!selectedProduct.id) {
                                                setMessage(
                                                    "Select product first"
                                                );
                                                return;
                                            }
                                            if (!selectedProduct.qty) {
                                                setMessage("Enter Qty");
                                                return;
                                            }

                                            const enteredQty =
                                                +selectedProduct.qty;

                                            const index = items.findIndex(
                                                (item) =>
                                                    item.id ===
                                                    selectedProduct.id
                                            );

                                            const totalQtyInItems =
                                                +items[index]?.qty || 0;

                                            if (
                                                enteredQty + totalQtyInItems >
                                                currentStock
                                            ) {
                                                setMessage(
                                                    "Stock not available"
                                                );
                                                return;
                                            }

                                            if (index === -1) {
                                                dispatch({
                                                    type: "add",
                                                    payload: selectedProduct,
                                                });
                                            } else {
                                                dispatch({
                                                    type: "updateQty",
                                                    payload: {
                                                        index,
                                                        qty: selectedProduct.qty,
                                                    },
                                                });
                                            }

                                            setSelectedProduct({
                                                id: "",
                                                name: "",
                                                qty: "",
                                            });
                                            setCurrentStock(0);
                                            productRef.current.focus();
                                        }}
                                    />
                                </Box>
                                <Box
                                    overflow={{ vertical: "auto" }}
                                    margin={{ bottom: "small" }}
                                    height={size === "large" ? "60%" : "50%"}
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
                                                <TableCell
                                                    scope="col"
                                                    border="bottom"
                                                >
                                                    <strong>Name</strong>
                                                </TableCell>
                                                <TableCell
                                                    scope="col"
                                                    border="bottom"
                                                >
                                                    <strong>Qty</strong>
                                                </TableCell>
                                                <TableCell
                                                    scope="col"
                                                    border="bottom"
                                                >
                                                    <strong>Actions</strong>
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        scope="row"
                                                        colSpan={3}
                                                        align="center"
                                                    >
                                                        <Text color={"dark-6"}>
                                                            No Data
                                                        </Text>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                items.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell scope="row">
                                                            {item.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {(+item.qty).toFixed(
                                                                0
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                pad={"small"}
                                                                icon={
                                                                    <Trash color="accent-1" />
                                                                }
                                                                onClick={() => {
                                                                    dispatch({
                                                                        type: "remove",
                                                                        payload:
                                                                            item.id,
                                                                    });
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                        {items.length > 0 && (
                                            <TableFooter
                                                style={{
                                                    position: "sticky",
                                                    bottom: "0",
                                                    backgroundColor: "#000",
                                                    zIndex: "1",
                                                }}
                                            >
                                                <TableRow>
                                                    <TableCell
                                                        scope="col"
                                                        border={{
                                                            side: "horizontal",
                                                        }}
                                                    ></TableCell>
                                                    <TableCell
                                                        scope="col"
                                                        border={{
                                                            side: "horizontal",
                                                        }}
                                                    >
                                                        <strong>
                                                            {(+data.total_qty).toFixed(
                                                                0
                                                            )}
                                                        </strong>
                                                    </TableCell>
                                                    <TableCell
                                                        scope="col"
                                                        border={{
                                                            side: "horizontal",
                                                        }}
                                                    ></TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        )}
                                    </Table>
                                </Box>
                                <Box direction="row" gap="medium" justify="end">
                                    <Button
                                        type="button"
                                        primary
                                        label="Submit"
                                        onClick={
                                            editId
                                                ? updateDelivery
                                                : saveDelivery
                                        }
                                        disabled={processing}
                                    />
                                    <Button
                                        type="reset"
                                        label="Reset"
                                        onClick={reset}
                                    />
                                </Box>
                            </>
                        )}
                    </Box>
                    <Box
                        gap={"small"}
                        pad={size === "large" ? "medium" : "small"}
                    >
                        <Box direction="row" justify="between" align="center">
                            <Heading level={3} margin={{ vertical: "small" }}>
                                Deliveries
                            </Heading>
                            <Toolbar>
                                <Button
                                    icon={<Download />}
                                    label="Excel"
                                    onClick={() =>
                                        excelExport(deliveries, "Deliveries")
                                    }
                                    size="small"
                                    primary
                                />
                            </Toolbar>
                        </Box>
                        <Box
                            width={"100%"}
                            overflow={{ vertical: "auto" }}
                            height={size === "large" ? "85%" : "80%"}
                            flex="grow"
                        >
                            <Data data={deliveries} toolbar>
                                <DataTable
                                    columns={[
                                        {
                                            property: "id",
                                            header: "No",
                                            primary: true,
                                        },
                                        {
                                            property: "created_at",
                                            header: "Date",
                                            render: (datum) =>
                                                new Date(
                                                    datum.created_at
                                                ).toLocaleDateString(),
                                        },
                                        {
                                            property: "ref_no",
                                            header: "Ref No",
                                        },
                                        {
                                            property: "from",
                                            header: "From",
                                        },
                                        {
                                            property: "to",
                                            header: "To",
                                        },
                                        {
                                            property: "total_qty",
                                            header: "Qty",
                                            render: (datum) =>
                                                (+datum.total_qty).toFixed(0),
                                        },
                                        {
                                            property: "created_by",
                                            header: "User",
                                        },
                                        {
                                            property: "actions",
                                            header: "Actions",
                                            render: (datum) => (
                                                <Box
                                                    direction="row"
                                                    gap={"xxsmall"}
                                                >
                                                    {props.auth.user.role !==
                                                        "user" && (
                                                        <Button
                                                            icon={
                                                                <Edit color="accent-1" />
                                                            }
                                                            hoverIndicator
                                                            onClick={async () => {
                                                                setLoading(
                                                                    true
                                                                );
                                                                reset();
                                                                setEditId(
                                                                    datum.id
                                                                );
                                                                let {
                                                                    data: {
                                                                        from,
                                                                        to,
                                                                        items,
                                                                    },
                                                                } =
                                                                    await axios.get(
                                                                        "/deliveries/" +
                                                                            datum.id
                                                                    );

                                                                setSelectedFromStation(
                                                                    {
                                                                        id: from.id.toString(),
                                                                        name: from.name,
                                                                    }
                                                                );

                                                                setSelectedToStation(
                                                                    {
                                                                        id: to.id.toString(),
                                                                        name: to.name,
                                                                    }
                                                                );

                                                                items.forEach(
                                                                    (item) => {
                                                                        dispatch(
                                                                            {
                                                                                type: "add",
                                                                                payload:
                                                                                    {
                                                                                        id: item.product_id,
                                                                                        name: item
                                                                                            .product
                                                                                            .name,
                                                                                        qty: item.qty,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }
                                                                );
                                                                setLoading(
                                                                    false
                                                                );
                                                            }}
                                                        />
                                                    )}
                                                    {props.auth.user.role ===
                                                        "admin" && (
                                                        <Button
                                                            icon={
                                                                <Trash color="accent-1" />
                                                            }
                                                            hoverIndicator
                                                            onClick={() =>
                                                                deleteDelivery(
                                                                    datum.id
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Box>
                                            ),
                                        },
                                    ]}
                                />
                            </Data>
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
                                time={2000}
                            />
                        )}
                    </Box>
                </Grid>
            )}
        </Box>
    );
};

export default Deliveries;
