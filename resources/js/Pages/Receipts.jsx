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
    FileInput,
    Collapsible,
} from "grommet";
import MyHeader from "./Components/Header";
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { Trash, Shop, Edit, Download, Add, FormSubtract } from "grommet-icons";
import axios from "axios";
import { format } from "date-fns";
import { excelExport, getColorByProductType } from "./Common/common";

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
    const { data, setData, processing, post } = useForm({
        station_id: "",
        total_qty: "",
        ref_no: "",
        ref_date: format(new Date(), "yyyy-MM-dd"),
        receipt_items: [],
        receipt_images: [],
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const [receipts, setReceipts] = useState(props.receipts);
    const [stations] = useState(props.stations);
    const [products] = useState(props.products);
    const [filteredProducts, setFilteredProducts] = useState(props.products);
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");
    const [items, dispatch] = useReducer(reducer, []);
    const [selectedProduct, setSelectedProduct] = useState({
        id: "",
        name: "",
        qty: "",
        product_type: "",
    });
    const [selectedStation, setSelectedStation] = useState(null);
    const productRef = useRef();
    const size = useContext(ResponsiveContext);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const reset = () => {
        setData({
            station_id: "",
            total_qty: "",
            ref_no: "",
            ref_date: format(new Date(), "yyyy-MM-dd"),
            receipt_items: [],
            receipt_images: [],
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
        post("/receipts/" + editId + "?_method=PUT", {
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

    const downloadImages = () => {
        data.receipt_images.forEach((image) => {
            if (image.image_url) {
                const downloadLink = document.createElement("a");
                downloadLink.href = image.image_url;
                let fileNameWithUniqId = image.image_url.split("/").pop();
                let fileName = fileNameWithUniqId.split("-").slice(1).join("-");
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
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
                    columns={showForm ? ["1/3", "2/3"] : []}
                    style={{ height: `calc(100% - ${headerHeight}px)` }}
                >
                    <Collapsible open={showForm}>
                        <Box
                            gap={size === "large" ? "medium" : "xxsmall"}
                            border={{ side: "right" }}
                            pad={size === "large" ? "medium" : "small"}
                            height={"100%"}
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
                                                        selectedStation?.id ||
                                                        ""
                                                    }
                                                    onChange={(e) => {
                                                        setSelectedStation(
                                                            e.option,
                                                        );
                                                    }}
                                                    size={
                                                        size === "large"
                                                            ? "medium"
                                                            : "small"
                                                    }
                                                    placeholder="Station"
                                                />
                                            </FormField>
                                        </Box>
                                        <Box basis="small">
                                            <FormField
                                                name="ref_no"
                                                htmlFor="ref_no"
                                            >
                                                <TextInput
                                                    id="ref_no"
                                                    name="ref_no"
                                                    value={data.ref_no}
                                                    onChange={(e) => {
                                                        setData((prev) => ({
                                                            ...prev,
                                                            ref_no: e.target
                                                                .value,
                                                        }));
                                                    }}
                                                    size={
                                                        size === "large"
                                                            ? "medium"
                                                            : "small"
                                                    }
                                                    placeholder="Ref No"
                                                />
                                            </FormField>
                                        </Box>
                                        <Box basis="medium">
                                            <FormField
                                                name="ref_date"
                                                htmlFor="ref_date"
                                            >
                                                <DateInput
                                                    format="dd/mm/yyyy"
                                                    value={data.ref_date}
                                                    onChange={({ value }) => {
                                                        setData((prev) => ({
                                                            ...prev,
                                                            ref_date: format(
                                                                value,
                                                                "yyyy-MM-dd",
                                                            ),
                                                        }));
                                                    }}
                                                    size={
                                                        size === "large"
                                                            ? "medium"
                                                            : "small"
                                                    }
                                                    placeholder="Ref Date"
                                                />
                                            </FormField>
                                        </Box>
                                    </Box>
                                    <Box
                                        gap="small"
                                        pad={{ bottom: "small" }}
                                        border={{
                                            side: "bottom",
                                            color: "accent-1",
                                        }}
                                    >
                                        <FileInput
                                            name="file"
                                            onChange={(event) => {
                                                const fileList = Array.from(
                                                    event.target.files,
                                                );
                                                if (fileList.length) {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        receipt_images:
                                                            fileList,
                                                    }));
                                                }
                                            }}
                                            multiple
                                            size={
                                                size === "large"
                                                    ? "medium"
                                                    : "small"
                                            }
                                            className="file-input"
                                        />
                                    </Box>
                                    <Box
                                        direction="row"
                                        gap={"small"}
                                        border={{
                                            side: "bottom",
                                            color: "accent-1",
                                        }}
                                        pad={{ vertical: "small" }}
                                        margin={{ bottom: "small" }}
                                    >
                                        <FormField
                                            name="product_id"
                                            htmlFor="product_id"
                                            style={{ flexBasis: "80%" }}
                                        >
                                            <Select
                                                id="product_id"
                                                name="product_id"
                                                options={filteredProducts}
                                                value={selectedProduct}
                                                valueKey="id"
                                                labelKey="name"
                                                size={
                                                    size === "large"
                                                        ? "medium"
                                                        : "small"
                                                }
                                                ref={productRef}
                                                placeholder="Product"
                                                onChange={(e) => {
                                                    setSelectedProduct(
                                                        (prev) => ({
                                                            ...prev,
                                                            id: e.value.id,
                                                            name: e.value.name,
                                                            product_type:
                                                                e.value
                                                                    .product_type,
                                                        }),
                                                    );
                                                    setFilteredProducts(
                                                        products,
                                                    );
                                                }}
                                                onSearch={(text) => {
                                                    if (!text) {
                                                        setFilteredProducts(
                                                            products,
                                                        );
                                                        return;
                                                    }

                                                    setFilteredProducts(
                                                        products.filter(
                                                            (product) =>
                                                                product.name
                                                                    .toLowerCase()
                                                                    .includes(
                                                                        text.toLowerCase(),
                                                                    ),
                                                        ),
                                                    );
                                                }}
                                            >
                                                {(option) => (
                                                    <Box
                                                        pad={{
                                                            vertical: "xsmall",
                                                        }}
                                                        margin={{
                                                            horizontal: "small",
                                                        }}
                                                    >
                                                        <Text
                                                            color={getColorByProductType(
                                                                option.product_type,
                                                            )}
                                                        >
                                                            {option.name}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Select>
                                        </FormField>

                                        <FormField name="qty" htmlFor="qty">
                                            <TextInput
                                                id="qty"
                                                name="qty"
                                                value={selectedProduct.qty}
                                                onChange={(e) => {
                                                    const qty = e.target.value;
                                                    if (isNaN(qty)) return;
                                                    setSelectedProduct(
                                                        (prev) => ({
                                                            ...prev,
                                                            qty: e.target.value,
                                                        }),
                                                    );
                                                }}
                                                size={
                                                    size === "large"
                                                        ? "medium"
                                                        : "small"
                                                }
                                                placeholder="Qty"
                                            />
                                        </FormField>
                                        <Button
                                            type="button"
                                            icon={<Add />}
                                            onClick={() => {
                                                if (!selectedProduct.id) {
                                                    setMessage(
                                                        "Select product first",
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
                                                        selectedProduct.id,
                                                );

                                                if (index === -1) {
                                                    dispatch({
                                                        type: "add",
                                                        payload:
                                                            selectedProduct,
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
                                            size={
                                                size === "large"
                                                    ? "medium"
                                                    : "small"
                                            }
                                        />
                                    </Box>
                                    <Box
                                        overflow={{ vertical: "auto" }}
                                        margin={{ bottom: "small" }}
                                        height={
                                            size === "large" ? "55%" : "50%"
                                        }
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
                                                            <Text
                                                                color={"dark-6"}
                                                            >
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
                                                                    0,
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    pad={
                                                                        "small"
                                                                    }
                                                                    icon={
                                                                        <Trash color="accent-1" />
                                                                    }
                                                                    onClick={() => {
                                                                        dispatch(
                                                                            {
                                                                                type: "remove",
                                                                                payload:
                                                                                    item.id,
                                                                            },
                                                                        );
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
                                                                    0,
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
                                    <Box
                                        direction="row"
                                        gap="medium"
                                        justify="end"
                                    >
                                        <Button
                                            type="button"
                                            primary
                                            label="Submit"
                                            onClick={
                                                editId
                                                    ? updateReceipt
                                                    : saveReceipt
                                            }
                                            disabled={processing}
                                        />
                                        <Button
                                            type="reset"
                                            label="Reset"
                                            onClick={reset}
                                        />
                                        {editId &&
                                            data.receipt_images.length > 0 &&
                                            data.receipt_images[0]
                                                .image_url && (
                                                <Button
                                                    type="button"
                                                    icon={
                                                        <Download color="accent-1" />
                                                    }
                                                    onClick={downloadImages}
                                                    title="Download Image"
                                                />
                                            )}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Collapsible>
                    <Box
                        gap={"small"}
                        pad={size === "large" ? "medium" : "small"}
                        height={"100%"}
                        width={"100%"}
                    >
                        <Box direction="row" justify="between" align="center">
                            <Box direction="row" align="center" gap="small">
                                <Heading
                                    level={3}
                                    margin={{ vertical: "small" }}
                                >
                                    Receipts
                                </Heading>
                                <Box
                                    direction="row"
                                    align="center"
                                    animation={{
                                        type: "fadeIn",
                                        duration: 200,
                                    }}
                                >
                                    <Text size="xlarge">{"["}</Text>
                                    <Button
                                        pad="none"
                                        onClick={() => setShowForm(!showForm)}
                                        hoverIndicator
                                        icon={
                                            showForm ? (
                                                <FormSubtract color="accent-1" />
                                            ) : (
                                                <Add color="accent-1" />
                                            )
                                        }
                                        alignSelf="center"
                                    />
                                    <Text size="xlarge">{"]"}</Text>
                                </Box>
                            </Box>
                            <Box direction="row" align="center" gap="small">
                                <Button
                                    icon={<Download />}
                                    label="Excel"
                                    onClick={() => {
                                        excelExport(receipts, "Receipts");
                                    }}
                                    size="small"
                                    primary
                                />
                            </Box>
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
                                            property: "s_no",
                                            header: "No",
                                            primary: true,
                                        },
                                        {
                                            property: "id",
                                            header: "R. No",
                                        },
                                        {
                                            property: "created_at",
                                            header: "Date",
                                            render: (datum) =>
                                                new Date(
                                                    datum.created_at,
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
                                                    datum.ref_date,
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
                                                            disabled={loading}
                                                            icon={
                                                                <Edit color="accent-1" />
                                                            }
                                                            hoverIndicator
                                                            onClick={async () => {
                                                                setLoading(
                                                                    true,
                                                                );
                                                                setShowForm(
                                                                    true,
                                                                );
                                                                reset();
                                                                setEditId(
                                                                    datum.id,
                                                                );
                                                                let {
                                                                    data: {
                                                                        ref_no,
                                                                        ref_date,
                                                                        station,
                                                                        items,
                                                                        images,
                                                                    },
                                                                } =
                                                                    await axios.get(
                                                                        "/receipts/" +
                                                                            datum.id,
                                                                    );

                                                                setSelectedStation(
                                                                    {
                                                                        id: station.id.toString(),
                                                                        name: station.name,
                                                                    },
                                                                );

                                                                setData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        ref_no: ref_no,
                                                                        ref_date:
                                                                            format(
                                                                                ref_date,
                                                                                "yyyy-MM-dd",
                                                                            ),
                                                                        receipt_images:
                                                                            images,
                                                                    }),
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
                                                                            },
                                                                        );
                                                                    },
                                                                );
                                                                setLoading(
                                                                    false,
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
                                                            onClick={() => {
                                                                if (
                                                                    window.confirm(
                                                                        "Are you sure to delete this receipt " + datum.id + "?",
                                                                    )
                                                                ) {
                                                                    deleteReceipt(
                                                                        datum.id,
                                                                    );
                                                                }
                                                            }}
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
