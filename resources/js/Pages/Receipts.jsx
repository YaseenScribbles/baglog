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

const Receipts = (props) => {
    const { data, setData, processing, post, put } = useForm({
        station_id: "",
        total_qty: "",
        ref_no: "",
        ref_date: format(new Date(), "yyyy-MM-dd"),
        receipt_items: [],
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const [receipts, setReceipts] = useState(props.receipts);
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
    const [selectedStation, setSelectedStation] = useState(null);
    const productRef = useRef();
    const size = useContext(ResponsiveContext);
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setData({
            station_id: "",
            total_qty: "",
            ref_no: "",
            ref_date: format(new Date(), "yyyy-MM-dd"),
            receipt_items: [],
        });
        setEditId(null);
        setSelectedStation(null);
        setSelectedProduct({
            id: "",
            name: "",
            qty: "",
        });
        dispatch({
            type: "clear",
        });
    };

    const saveReceipt = () => {
        if (!data.station_id) {
            setMessage("Select station first");
            return;
        }
        if (!data.ref_no) {
            setMessage("Enter ref no");
            return;
        }
        if (items.length === 0) {
            setMessage("No Data");
            return;
        }

        post("/receipts", {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.receipts) {
                    setReceipts(page.props.receipts);
                }
                reset();
                setMessage("Receipt saved successfully");
            },
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const updateReceipt = () => {
        if (!data.station_id) {
            setMessage("Select station first");
            return;
        }
        if (!data.ref_no) {
            setMessage("Enter ref no");
            return;
        }
        if (items.length === 0) {
            setMessage("No Data");
            return;
        }
        put("/receipts/" + editId, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.receipts) {
                    setReceipts(page.props.receipts);
                }
                reset();
                setMessage("Receipt updated successfully");
            },
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const deleteReceipt = (id) => {
        router.delete("/receipts/" + id, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.receipts) {
                    setReceipts(page.props.receipts);
                }
                setMessage("Receipt deleted successfully");
            },
        });
    };

    useEffect(() => {
        if (selectedStation) {
            setData((prev) => ({
                ...prev,
                station_id: selectedStation.id,
            }));
        }
    }, [selectedStation]);

    useEffect(() => {
        const qty = items?.reduce((acc, curr) => acc + +curr.qty, 0);

        setData((prev) => ({
            ...prev,
            total_qty: qty,
            receipt_items: items.map((item) => ({
                product_id: item.id,
                qty: item.qty,
            })),
        }));
    }, [items]);

    return (
        <Box height={"100dvh"}>
            <MyHeader
                onHeightChange={setHeaderHeight}
                role={props.auth.user.role}
                name={props.auth.user.name}
            />
            {headerHeight > 0 && (
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
                                        ? "Update Receipt"
                                        : "Create Receipt"}
                                </Heading>
                                <Box direction="row" gap={"small"}>
                                    <Box basis="medium">
                                        <FormField
                                            name="station_id"
                                            htmlFor="station_id"
                                            label="Station"
                                        >
                                            <Select
                                                id="station_id"
                                                name="station_id"
                                                options={stations}
                                                labelKey={"name"}
                                                valueKey={{
                                                    key: "id",
                                                    reduce: true,
                                                }}
                                                value={
                                                    selectedStation?.id || ""
                                                }
                                                onChange={(e) => {
                                                    setSelectedStation(
                                                        e.option
                                                    );
                                                }}
                                                size="small"
                                            />
                                        </FormField>
                                    </Box>
                                    <Box basis="small">
                                        <FormField
                                            name="ref_no"
                                            htmlFor="ref_no"
                                            label="Ref No"
                                        >
                                            <TextInput
                                                id="ref_no"
                                                name="ref_no"
                                                value={data.ref_no}
                                                onChange={(e) => {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        ref_no: e.target.value,
                                                    }));
                                                }}
                                                size="small"
                                            />
                                        </FormField>
                                    </Box>
                                    <Box basis="medium">
                                        <FormField
                                            name="ref_date"
                                            htmlFor="ref_date"
                                            label="Ref Date"
                                        >
                                            <DateInput
                                                format="dd/mm/yyyy"
                                                value={data.ref_date}
                                                onChange={({ value }) => {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        ref_date: format(
                                                            value,
                                                            "yyyy-MM-dd"
                                                        ),
                                                    }));
                                                }}
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
                                        />
                                    </FormField>
                                    <FormField
                                        name="qty"
                                        htmlFor="qty"
                                        label="Qty"
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
                                        />
                                    </FormField>
                                    <Button
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

                                            const index = items.findIndex(
                                                (item) =>
                                                    item.id ===
                                                    selectedProduct.id
                                            );

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
                                            editId ? updateReceipt : saveReceipt
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
                                Receipts
                            </Heading>
                            <Toolbar>
                                <Button
                                    icon={<Download />}
                                    label="Excel"
                                    onClick={() =>
                                        excelExport(receipts, "Receipts")
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
                            {/* <Table>
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
                                            <strong>No</strong>
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            <strong>Date</strong>
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            <strong>Ref No</strong>
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            <strong>Ref Date</strong>
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            <strong>Name</strong>
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            <strong>Qty</strong>
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            <strong>User</strong>
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            <strong>Actions</strong>
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {receipts.length > 0 &&
                                        receipts.map((receipt, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {receipt.id}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        receipt.created_at
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {receipt.ref_no}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        receipt.ref_date
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {receipt.name}
                                                </TableCell>
                                                <TableCell>
                                                    {(+receipt.total_qty).toFixed(
                                                        0
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {receipt.created_by}
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
                                                            onClick={async () => {
                                                                setLoading(
                                                                    true
                                                                );
                                                                reset();
                                                                setEditId(
                                                                    receipt.id
                                                                );
                                                                let {
                                                                    data: {
                                                                        ref_no,
                                                                        ref_date,
                                                                        station,
                                                                        items,
                                                                    },
                                                                } =
                                                                    await axios.get(
                                                                        "/receipts/" +
                                                                            receipt.id
                                                                    );

                                                                setSelectedStation(
                                                                    {
                                                                        id: station.id.toString(),
                                                                        name: station.name,
                                                                    }
                                                                );

                                                                setData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        ref_no: ref_no,
                                                                        ref_date:
                                                                            format(
                                                                                ref_date,
                                                                                "yyyy-MM-dd"
                                                                            ),
                                                                    })
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
                                                        {props.auth.user
                                                            .role ===
                                                            "admin" && (
                                                            <Button
                                                                icon={
                                                                    <Trash color="accent-1" />
                                                                }
                                                                hoverIndicator
                                                                onClick={() =>
                                                                    deleteReceipt(
                                                                        receipt.id
                                                                    )
                                                                }
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
                                                colSpan={8}
                                                justify="center"
                                                align="center"
                                            >
                                                <Spinner color={"accent-1"} />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table> */}
                            <Data data={receipts} toolbar>
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
                                            property: "ref_date",
                                            header: "Ref Date",
                                            render: (datum) =>
                                                new Date(
                                                    datum.ref_date
                                                ).toLocaleDateString(),
                                        },
                                        {
                                            property: "name",
                                            header: "Station",
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
                                                                        ref_no,
                                                                        ref_date,
                                                                        station,
                                                                        items,
                                                                    },
                                                                } =
                                                                    await axios.get(
                                                                        "/receipts/" +
                                                                            datum.id
                                                                    );

                                                                setSelectedStation(
                                                                    {
                                                                        id: station.id.toString(),
                                                                        name: station.name,
                                                                    }
                                                                );

                                                                setData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        ref_no: ref_no,
                                                                        ref_date:
                                                                            format(
                                                                                ref_date,
                                                                                "yyyy-MM-dd"
                                                                            ),
                                                                    })
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
                                                                deleteReceipt(
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

export default Receipts;
