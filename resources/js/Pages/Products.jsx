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
    ResponsiveContext,
    DataTable,
    Data,
    DataSearch,
} from "grommet";
import MyHeader from "./Components/Header";
import { useContext, useState } from "react";
import { Edit, Trash, Shop } from "grommet-icons";

const Products = (props) => {
    const { data, setData, processing, post, put } = useForm({
        code: "",
        name: "",
        costprice: "",
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const [products, setProducts] = useState(props.products);
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
            code: "",
            name: "",
            costprice: "",
        });
        setEditId(null);
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
        put("/products/" + editId, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props?.products) {
                    setProducts(page.props.products);
                }
                reset();
                setMessage("Product updated successfully");
            },
            onError: (errors) => {
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

    return (
        <Box height={"100dvh"}>
            <MyHeader
                onHeightChange={setHeaderHeight}
                role={props.auth.user.role}
            />
            {headerHeight && (
                <Grid
                    columns={["1/4", "3/4"]}
                    style={{
                        height: `calc(100% - ${headerHeight}px)`,
                    }}
                >
                    <Box
                        gap={size === "large" ? "medium" : "xxsmall"}
                        border={{ side: "right" }}
                        pad={size === "large" ? "medium" : "small"}
                    >
                        <Heading level={3}>
                            {editId ? "Update Product" : "Create Product"}
                        </Heading>
                        <FormField name="code" htmlFor="code" label="Code">
                            <TextInput
                                id="code"
                                name="code"
                                value={data.code}
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField name="name" htmlFor="name" label="Name">
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                            />
                        </FormField>
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
                            />
                        </FormField>
                        <Box direction="row" gap="medium" justify="end">
                            <Button
                                type="button"
                                primary
                                label="Submit"
                                onClick={editId ? updateProduct : saveProduct}
                                disabled={processing}
                            />
                            <Button
                                type="reset"
                                label="Reset"
                                onClick={reset}
                            />
                        </Box>
                    </Box>
                    <Box
                        gap={"small"}
                        pad={size === "large" ? "medium" : "small"}
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
                                                        onClick={() => {
                                                            setEditId(datum.id);
                                                            setData({
                                                                code: datum.code,
                                                                name: datum.name,
                                                                costprice:
                                                                    datum.costprice,
                                                            });
                                                        }}
                                                    />
                                                    {props.auth.user.role ===
                                                        "admin" && (
                                                        <Button
                                                            icon={
                                                                <Trash color="accent-1" />
                                                            }
                                                            hoverIndicator
                                                            onClick={() =>
                                                                deleteProduct(
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
