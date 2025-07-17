import {
    Box,
    Button,
    Data,
    DataTable,
    Heading,
    ResponsiveContext,
    Spinner,
    Text,
} from "grommet";
import { Download, Refresh } from "grommet-icons";
import { excelExport } from "../Common/common";
import { useForm } from "@inertiajs/react";
import MyHeader from "../Components/Header";
import { useContext, useEffect, useState } from "react";

export default function Stock(props) {
    const { get, processing } = useForm();
    const [headerHeight, setHeaderHeight] = useState(0);
    const size = useContext(ResponsiveContext);
    const [stock, setStock] = useState([]);

    const getStock = () => {
        get("/stock", {
            preserveState: true,
            preserveScroll: true,
            only: ["stock"],
        });
    };

    useEffect(() => {
        if (props) {
            const formattedStock = props.stock.map((e) => ({
                ...e,
                qty: +e.qty,
            }));
            setStock(formattedStock);
        }
    }, [props]);

    return (
        <Box
            gap={size === "large" ? "small" : "xxsmall"}
            pad={"none"}
            height={"100dvh"}
            width={"100%"}
        >
            <MyHeader
                role={props.auth.user.role}
                onHeightChange={setHeaderHeight}
                name={props.auth.user.name}
            />
            {headerHeight > 0 && (
                <Box
                    height={`calc(100dvh - ${headerHeight}px)`}
                    overflow={{ vertical: "auto" }}
                >
                    <Box
                        direction="row"
                        justify="between"
                        align="center"
                        pad={
                            size === "large"
                                ? { horizontal: "small" }
                                : { horizontal: "xsmall" }
                        }
                    >
                        <Box>
                            <Heading level={3}>Stock Report</Heading>
                        </Box>
                        <Box>
                            {processing && (
                                <Spinner color={"accent-1"} size="medium" />
                            )}
                        </Box>
                        <Box direction="row" gap={"small"} align="center">
                            <Button
                                primary
                                icon={<Refresh />}
                                onClick={getStock}
                                disabled={processing}
                            />
                            <Button
                                onClick={() =>
                                    excelExport(stock, "Stock Report")
                                }
                                icon={<Download />}
                                primary
                            />
                        </Box>
                    </Box>
                    <Box
                        flex="grow"
                        overflow={{ vertical: "auto" }}
                        pad={
                            size === "large"
                                ? { horizontal: "small" }
                                : { horizontal: "xsmall" }
                        }
                        height={size === "large" ? "85%" : "80%"}
                    >
                        <Data data={stock} toolbar>
                            <DataTable
                                columns={[
                                    {
                                        property: "s_no",
                                        header: (
                                            <Text weight="bold">S. No</Text>
                                        ),
                                    },
                                    {
                                        property: "station",
                                        header: (
                                            <Text weight="bold">Station</Text>
                                        ),
                                    },
                                    {
                                        property: "product",
                                        header: (
                                            <Text weight="bold">Product</Text>
                                        ),
                                    },
                                    {
                                        property: "qty",
                                        header: <Text weight="bold">Qty</Text>,
                                        render: (datum) =>
                                            (+datum.qty).toFixed(0),
                                        aggregate: "sum",
                                        footer: { aggregate: true },
                                        align: "end",
                                    },
                                ]}
                            />
                        </Data>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
