import {
    Box,
    Button,
    Data,
    DataTable,
    DateInput,
    Heading,
    ResponsiveContext,
    Spinner,
    Text,
} from "grommet";
import { Download, Search } from "grommet-icons";
import { excelExport } from "../Common/common";
import { useForm } from "@inertiajs/react";
import MyHeader from "../Components/Header";
import { useContext, useEffect, useState } from "react";
import { format, startOfMonth } from "date-fns";

export default function Received(props) {
    const { data, setData, get, processing } = useForm({
        from_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        to_date: format(new Date(), "yyyy-MM-dd"),
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const size = useContext(ResponsiveContext);
    const [received, setReceived] = useState([]);

    const getReceived = () => {
        get("/received", {
            preserveState: true,
            preserveScroll: true,
            only: ["received"],
        });
    };

    useEffect(() => {
        if (props) {
            const formattedReceived = props.received.map((e) => ({
                ...e,
                qty: +e.qty,
            }));
            setReceived(formattedReceived);
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
                            <Heading level={3}>Received Report</Heading>
                        </Box>
                        <Box>
                            {processing && (
                                <Spinner color={"accent-1"} size="medium" />
                            )}
                        </Box>
                        <Box direction="row" gap={"small"} align="center">
                            <DateInput
                                format="dd/mm/yyyy"
                                value={data.from_date}
                                onChange={({ value }) => {
                                    setData((prev) => ({
                                        ...prev,
                                        from_date: format(value, "yyyy-MM-dd"),
                                    }));
                                }}
                                size="small"
                                inputProps={{ readOnly: true }}
                            />
                            <DateInput
                                format="dd/mm/yyyy"
                                value={data.to_date}
                                onChange={({ value }) => {
                                    setData((prev) => ({
                                        ...prev,
                                        to_date: format(value, "yyyy-MM-dd"),
                                    }));
                                }}
                                size="small"
                                dropProps={{
                                    align: {
                                        top: "bottom",
                                        right: "right",
                                    },
                                }}
                                inputProps={{ readOnly: true }}
                            />
                            <Button
                                primary
                                icon={<Search />}
                                onClick={getReceived}
                                disabled={processing}
                            />
                            <Button
                                onClick={() =>
                                    excelExport(
                                        received,
                                        `Received Report ${format(
                                            data.from_date,
                                            "d-MMM"
                                        )} to ${format(data.to_date, "d-MMM")}`
                                    )
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
                        <Data data={received} toolbar>
                            <DataTable
                                columns={[
                                    {
                                        property: "s_no",
                                        header: (
                                            <Text weight="bold">S. No</Text>
                                        ),
                                    },
                                    {
                                        property: "id",
                                        header: (
                                            <Text weight="bold">R. No</Text>
                                        ),
                                    },
                                    {
                                        property: "created_at",
                                        header: <Text weight="bold">Date</Text>,
                                        render: (datum) =>
                                            new Date(
                                                datum.created_at
                                            ).toLocaleDateString(),
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
