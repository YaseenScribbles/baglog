import { router, useForm } from "@inertiajs/react";
import {
    Box,
    Grid,
    Heading,
    FormField,
    TextInput,
    Button,
    Notification,
    Spinner,
    ResponsiveContext,
    DataTable,
    Data,
    FileInput,
    Select,
} from "grommet";
import MyHeader from "./Components/Header";
import { useContext, useEffect, useState } from "react";
import { Edit, Trash, Shop, FormClose } from "grommet-icons";
import axios from "axios";

const Products = (props) => {
    const { data, setData, processing, post } = useForm({
        code: "",
        name: "",
        costprice: "",
        per_pack: "",
        product_type: "",
        images: [],
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const [products, setProducts] = useState(props.products);
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");
    const size = useContext(ResponsiveContext);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const [loading, setLoading] = useState(false);
    const [selectedProductType, setSelectedProductType] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const reset = () => {
        setData({
            code: "",
            name: "",
            costprice: "",
            per_pack: "",
            product_type: "",
            images: [],
        });
        setEditId(null);
        setFileInputKey(Date.now());
    };

    const saveProduct = () => {
        post("/products", {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.products) {
                    setProducts(page.props.products);
                }
                reset();
                setMessage("Product saved successfully");
            },
            onError: (errors) => {
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const updateProduct = () => {
        console.log(data);
        post("/products/" + editId + "?_method=PUT", {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.products) {
                    setProducts(page.props.products);
                }
                reset();
                setMessage("Product updated successfully");
            },
            onError: (errors) => {
                console.log(errors);
                let firstError = Object.values(errors)[0];
                setMessage(firstError);
            },
        });
    };

    const deleteProduct = (id) => {
        router.delete("/products/" + id, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.products) {
                    setProducts(page.props.products);
                }
                setMessage("Product deleted successfully");
            },
        });
    };

    useEffect(() => {
        if (selectedProductType) {
            setData((prev) => ({
                ...prev,
                product_type: selectedProductType.id,
            }));
        }
    }, [selectedProductType]);

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
                    {loading ? (
                        <Box align="center" justify="center">
                            <Spinner color={"accent-1"} />
                        </Box>
                    ) : (
                        <Box
                            gap={size === "large" ? "medium" : "xxsmall"}
                            border={{ side: "right" }}
                            pad={
                                size === "large"
                                    ? "medium"
                                    : {
                                          horizontal: "small",
                                          vertical: "xsmall",
                                      }
                            }
                        >
                            <Heading level={3}>
                                {editId ? "Update Product" : "Create Product"}
                            </Heading>
                            <Box direction="row" gap={"xsmall"} flex="grow">
                                <Box basis="30%">
                                    <FormField
                                        name="code"
                                        htmlFor="code"
                                        label="Code"
                                    >
                                        <TextInput
                                            id="code"
                                            name="code"
                                            value={data.code}
                                            onChange={handleChange}
                                            size={
                                                size === "large"
                                                    ? "medium"
                                                    : "small"
                                            }
                                        />
                                    </FormField>
                                </Box>
                                <Box basis="70%">
                                    <FormField
                                        name="name"
                                        htmlFor="name"
                                        label="Name"
                                    >
                                        <TextInput
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            onChange={handleChange}
                                            size={
                                                size === "large"
                                                    ? "medium"
                                                    : "small"
                                            }
                                        />
                                    </FormField>
                                </Box>
                            </Box>
                            <Box direction="row" gap={"xsmall"} flex="grow">
                                <Box>
                                    <FormField
                                        name="costprice"
                                        htmlFor="costprice"
                                        label="Cost Price"
                                    >
                                        <TextInput
                                            id="costprice"
                                            name="costprice"
                                            value={data.costprice ?? ""}
                                            onChange={handleChange}
                                            size={
                                                size === "large"
                                                    ? "medium"
                                                    : "small"
                                            }
                                        />
                                    </FormField>
                                </Box>
                                <Box>
                                    <FormField
                                        name="per_pack"
                                        htmlFor="per_pack"
                                        label="Per Pack"
                                    >
                                        <TextInput
                                            id="per_pack"
                                            name="per_pack"
                                            value={data.per_pack ?? ""}
                                            onChange={handleChange}
                                            size={
                                                size === "large"
                                                    ? "medium"
                                                    : "small"
                                            }
                                        />
                                    </FormField>
                                </Box>
                            </Box>
                            <Box direction="row" gap={"xsmall"} flex="grow">
                                <Box basis="100%" height={"100%"}>
                                    <FormField
                                        name="product_type"
                                        htmlFor="product_type"
                                        label="Product Type"
                                    >
                                        <Select
                                            id="product_type"
                                            name="product_type"
                                            options={[
                                                {
                                                    id: "accessory",
                                                    name: "Accessory",
                                                },
                                                { id: "gift", name: "Gift" },
                                            ]}
                                            labelKey={"name"}
                                            valueKey={{
                                                key: "id",
                                                reduce: true,
                                            }}
                                            value={
                                                selectedProductType?.id || ""
                                            }
                                            onChange={(e) => {
                                                setSelectedProductType(
                                                    e.option,
                                                );
                                            }}
                                            size={
                                                size === "large"
                                                    ? "medium"
                                                    : "small"
                                            }
                                        />
                                    </FormField>
                                </Box>
                            </Box>
                            <Box
                                margin={{ bottom: "small" }}
                                height="300px"
                                overflow={{ vertical: "auto" }}
                            >
                                <FileInput
                                    key={fileInputKey}
                                    name="file"
                                    onChange={(event) => {
                                        const fileList = Array.from(
                                            event.target.files,
                                        );
                                        const newImages = fileList.map(
                                            (file) => ({
                                                is_new: true,
                                                image: file,
                                                path: URL.createObjectURL(file),
                                            }),
                                        );

                                        setData((prev) => ({
                                            ...prev,
                                            images: [
                                                ...prev.images,
                                                ...newImages,
                                            ],
                                        }));
                                    }}
                                    multiple
                                    className="product-image"
                                />

                                <Box direction="row" wrap>
                                    {data.images &&
                                        data.images.length > 0 &&
                                        data.images.map((image, index) => (
                                            <Box
                                                key={index}
                                                height="125px"
                                                width="125px"
                                                margin="xsmall"
                                                round="small"
                                                overflow="hidden"
                                                background="light-2"
                                                align="center"
                                                justify="center"
                                                style={{
                                                    position: "relative",
                                                }}
                                            >
                                                <img
                                                    src={image.path}
                                                    alt="preview"
                                                    height="100%"
                                                    style={{
                                                        objectFit: "cover",
                                                        width: "100%",
                                                    }}
                                                />
                                                <Button
                                                    icon={
                                                        <FormClose color="status-critical" />
                                                    }
                                                    onClick={() => {
                                                        const updated =
                                                            data.images.filter(
                                                                (_, i) =>
                                                                    i !== index,
                                                            );
                                                        setData((prev) => ({
                                                            ...prev,
                                                            images: updated,
                                                        }));
                                                    }}
                                                    plain
                                                    style={{
                                                        position: "absolute",
                                                        top: "2px",
                                                        right: "2px",
                                                        background:
                                                            "rgba(255,255,255,0.7)",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                </Box>
                            </Box>
                            <Box flex="grow" justify="center">
                                <Box direction="row" gap="medium" justify="end">
                                    {props.auth.user.role !== "user" && (
                                        <Button
                                            type="button"
                                            primary
                                            label="Submit"
                                            onClick={
                                                editId
                                                    ? updateProduct
                                                    : saveProduct
                                            }
                                            disabled={processing}
                                        />
                                    )}
                                    <Button
                                        type="reset"
                                        label="Reset"
                                        onClick={reset}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}
                    <Box
                        gap={size === "large" ? "medium" : "xxsmall"}
                        pad={
                            size === "large"
                                ? "medium"
                                : { horizontal: "small", vertical: "xsmall" }
                        }
                    >
                        <Heading level={3}>Products</Heading>
                        <Box
                            flex="grow"
                            overflow={{ vertical: "auto" }}
                            height={size === "large" ? "85%" : "80%"}
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
                                            Code
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            Name
                                        </TableCell>
                                        <TableCell scope="col" border="bottom">
                                            Cost Price
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
                                    {products.length > 0 &&
                                        products.map((product, index) => (
                                            <TableRow key={index}>
                                                <TableCell scope="row">
                                                    <strong>
                                                        {product.code}
                                                    </strong>
                                                </TableCell>
                                                <TableCell>
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>
                                                    {product.costprice}
                                                </TableCell>
                                                <TableCell>
                                                    {product.created_by}
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
                                                                    product.id
                                                                );
                                                                setData({
                                                                    code: product.code,
                                                                    name: product.name,
                                                                    costprice:
                                                                        product.costprice,
                                                                });
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
                                                                    deleteProduct(
                                                                        product.id
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
                                                colSpan={5}
                                                justify="center"
                                                align="center"
                                            >
                                                <Spinner color={"accent-1"} />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table> */}
                            <Data data={products} toolbar>
                                <DataTable
                                    columns={[
                                        {
                                            property: "code",
                                            header: "Code",
                                        },
                                        {
                                            property: "name",
                                            header: "Name",
                                        },
                                        {
                                            property: "costprice",
                                            header: "Cost Price",
                                        },
                                        {
                                            property: "per_pack",
                                            header: "Per Pack",
                                        },
                                        {
                                            property: "product_type",
                                            header: "Product Type",
                                        },
                                        {
                                            property: "created_by",
                                            header: "Created By",
                                        },
                                        {
                                            property: "actions",
                                            header: "Actions",
                                            render: (datum) => (
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
                                                            setLoading(true);
                                                            setEditId(datum.id);

                                                            const {
                                                                data: {
                                                                    product: {
                                                                        images,
                                                                    },
                                                                },
                                                            } = await axios.get(
                                                                "/products/" +
                                                                    datum.id,
                                                            );

                                                            const oldImages =
                                                                images.map(
                                                                    (
                                                                        image,
                                                                    ) => ({
                                                                        is_new: false,
                                                                        image: null,
                                                                        path: image.img_path,
                                                                    }),
                                                                );

                                                            setData({
                                                                code: datum.code,
                                                                name: datum.name,
                                                                costprice:
                                                                    datum.costprice,
                                                                per_pack:
                                                                    datum.per_pack,
                                                                images: oldImages,
                                                            });
                                                            setSelectedProductType(
                                                                {
                                                                    id: datum.product_type,
                                                                    name:
                                                                        datum.product_type
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase() +
                                                                        datum.product_type.slice(
                                                                            1,
                                                                        ),
                                                                },
                                                            );
                                                            setLoading(false);
                                                        }}
                                                    />
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
                                                                        "Are you sure to remove this product " +
                                                                            datum.name +
                                                                            "?",
                                                                    )
                                                                ) {
                                                                    deleteProduct(
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
                                time={3000}
                            />
                        )}
                    </Box>
                </Grid>
            )}
        </Box>
    );
};

export default Products;
