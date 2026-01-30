import {
    Box,
    Button,
    DateInput,
    Grid,
    Heading,
    ResponsiveContext,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHeader,
    TableRow,
    Text,
} from "grommet";
import MyHeader from "./Components/Header";
import { useContext, useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { format, startOfMonth } from "date-fns";
import { Search, Download } from "grommet-icons";
import * as XLSX from "xlsx";

const Dashboard = (props) => {
    const [stations, setStations] = useState([]);
    const [stock, setStock] = useState([]);
    const { data, setData, get, processing } = useForm({
        from_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        to_date: format(new Date(), "yyyy-MM-dd"),
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const size = useContext(ResponsiveContext);

    useEffect(() => {
        if (props.stock) {
            let stations = props.stock.map((stock) => stock.station);
            let distinctStations = Array.from(new Set(stations));
            setStations(distinctStations);
            setStock(props.stock);
        }
    }, [props]);

    const getStock = () => {
        get("/dashboard", {
            preserveState: true,
            preserveScroll: true,
            onError: (errors) => {
                window.alert(Object.values(errors)[0]);
            },
        });
    };

    const exportStockToExcel = () => {
        const workbook = XLSX.utils.book_new();

        const stations = [...new Set(stock.map((s) => s.station))];

        stations.forEach((station) => {
            const headers = [
                "Product",
                "Prev. Qty",
                "Prev. Value",
                "Del. Qty",
                "Del. Value",
                "Rec. Qty",
                "Rec. Value",
                "Curr. Qty",
                "Curr. Value",
            ];

            const filtered = stock.filter((s) => s.station === station);

            const rows = filtered.map((e) => [
                e.product.toUpperCase(),
                (+e.from).toFixed(0),
                (+e.from_value).toFixed(2),
                (+e.delivery).toFixed(0),
                (+e.delivery_value).toFixed(2),
                (+e.receipt).toFixed(0),
                (+e.receipt_value).toFixed(2),
                (+e.to).toFixed(0),
                (+e.to_value).toFixed(2),
            ]);

            // Footer totals
            const totals = filtered.reduce(
                (acc, curr) => {
                    acc[0] += +curr.from;
                    acc[1] += +curr.from_value;
                    acc[2] += +curr.delivery;
                    acc[3] += +curr.delivery_value;
                    acc[4] += +curr.receipt;
                    acc[5] += +curr.receipt_value;
                    acc[6] += +curr.to;
                    acc[7] += +curr.to_value;
                    return acc;
                },
                [0, 0, 0, 0, 0, 0, 0, 0]
            );

            const footerRow = [
                "Total",
                totals[0].toFixed(0),
                totals[1].toFixed(2),
                totals[2].toFixed(0),
                totals[3].toFixed(2),
                totals[4].toFixed(0),
                totals[5].toFixed(2),
                totals[6].toFixed(0),
                totals[7].toFixed(2),
            ];

            const sheetData = [headers, ...rows, footerRow];

            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, station);
        });

        // Export
        XLSX.writeFile(workbook, "Stock_By_Station.xlsx");
    };

    return (
        <Box height={"100dvh"}>
            <MyHeader
                role={props.auth.user.role}
                onHeightChange={setHeaderHeight}
                name={props.auth.user.name}
            />
            {headerHeight > 0 && (
                <Box
                    height={`calc(100% - ${headerHeight}px)`}
                    overflow={{ vertical: "auto" }}
                >
                    <Grid
                        gap={"small"}
                        rows={["70px", "auto"]}
                        columns={size === "large" ? "45%" : ""}
                        pad={"small"}
                    >
                        <Box
                            style={{ gridColumn: "1/-1" }}
                            direction="row"
                            justify="between"
                            align="center"
                            border="bottom"
                            pad={"small"}
                        >
                            <Heading level={3}>Dashboard</Heading>
                            {processing && (
                                <Spinner color={"accent-1"} size="medium" />
                            )}
                            <Box direction="row" gap={"small"} align="center">
                                <DateInput
                                    format="dd/mm/yyyy"
                                    value={data.from_date}
                                    onChange={({ value }) => {
                                        setData((prev) => ({
                                            ...prev,
                                            from_date: format(
                                                value,
                                                "yyyy-MM-dd"
                                            ),
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
                                            to_date: format(
                                                value,
                                                "yyyy-MM-dd"
                                            ),
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
                                    onClick={getStock}
                                    disabled={processing}
                                />
                                <Button
                                    onClick={exportStockToExcel}
                                    icon={<Download />}
                                    primary
                                />
                            </Box>
                        </Box>
                        {!processing &&
                            stations.length > 0 &&
                            stations.map((station, index) => (
                                <Box
                                    key={index}
                                    background={{ color: `neutral-${index}` }}
                                    round="small"
                                >
                                    <Box
                                        align="center"
                                        pad={"small"}
                                        border={{
                                            side: "bottom",
                                            color: "light-4",
                                            size: "small",
                                        }}
                                    >
                                        <Heading
                                            color={"light-1"}
                                            level={"6"}
                                            margin={{ vertical: "xsmall" }}
                                        >
                                            {station.toUpperCase()}
                                        </Heading>
                                    </Box>
                                    <Box
                                        width={"100%"}
                                        overflow={{ horizontal: "auto" }}
                                    >
                                        <Table>
                                            <TableHeader
                                                style={{
                                                    borderBottom:
                                                        "2px solid #fff",
                                                }}
                                            >
                                                <TableRow>
                                                    <TableCell>
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            Product
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            Prev. Qty
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            Prev. Value
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            Del. Qty
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            Del. Value
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            Rec. Qty
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            Rec. Value
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            Curr. Qty
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            Curr. Value
                                                        </Text>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {stock.length > 0 &&
                                                    stock
                                                        .filter(
                                                            (s) =>
                                                                s.station ==
                                                                station
                                                        )
                                                        .map((e, index) => (
                                                            <TableRow
                                                                key={index}
                                                            >
                                                                <TableCell>
                                                                    <Text
                                                                        color="light-1"
                                                                        size={size === "large" ? "xsmall" : "small"}
                                                                    >
                                                                        {e.product.toUpperCase()}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size={size === "large" ? "xsmall" : "small"}
                                                                    >
                                                                        {(+e.from).toFixed(
                                                                            0
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size={size === "large" ? "xsmall" : "small"}
                                                                    >
                                                                        {(
                                                                            +e.from_value
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size={size === "large" ? "xsmall" : "small"}
                                                                    >
                                                                        {(+e.delivery).toFixed(
                                                                            0
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size={size === "large" ? "xsmall" : "small"}
                                                                    >
                                                                        {(
                                                                            +e.delivery_value
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size={size === "large" ? "xsmall" : "small"}
                                                                    >
                                                                        {(+e.receipt).toFixed(
                                                                            0
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size={size === "large" ? "xsmall" : "small"}
                                                                    >
                                                                        {(
                                                                            +e.receipt_value
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size={size === "large" ? "xsmall" : "small"}
                                                                    >
                                                                        {(+e.to).toFixed(
                                                                            0
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size={size === "large" ? "xsmall" : "small"}
                                                                    >
                                                                        {(
                                                                            +e.to_value
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                            </TableBody>
                                            <TableFooter
                                                style={{
                                                    borderTop: "2px solid #fff",
                                                }}
                                            >
                                                <TableRow>
                                                    <TableCell></TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            {stock
                                                                .filter(
                                                                    (s) =>
                                                                        s.station ==
                                                                        station
                                                                )
                                                                .reduce(
                                                                    (
                                                                        acc,
                                                                        curr
                                                                    ) =>
                                                                        acc +
                                                                        +curr.from,
                                                                    0
                                                                )
                                                                .toFixed(0)}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            {stock
                                                                .filter(
                                                                    (s) =>
                                                                        s.station ==
                                                                        station
                                                                )
                                                                .reduce(
                                                                    (
                                                                        acc,
                                                                        curr
                                                                    ) =>
                                                                        acc +
                                                                        +curr.from_value,
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            {stock
                                                                .filter(
                                                                    (s) =>
                                                                        s.station ==
                                                                        station
                                                                )
                                                                .reduce(
                                                                    (
                                                                        acc,
                                                                        curr
                                                                    ) =>
                                                                        acc +
                                                                        +curr.delivery,
                                                                    0
                                                                )
                                                                .toFixed(0)}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            {stock
                                                                .filter(
                                                                    (s) =>
                                                                        s.station ==
                                                                        station
                                                                )
                                                                .reduce(
                                                                    (
                                                                        acc,
                                                                        curr
                                                                    ) =>
                                                                        acc +
                                                                        +curr.delivery_value,
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            {stock
                                                                .filter(
                                                                    (s) =>
                                                                        s.station ==
                                                                        station
                                                                )
                                                                .reduce(
                                                                    (
                                                                        acc,
                                                                        curr
                                                                    ) =>
                                                                        acc +
                                                                        +curr.receipt,
                                                                    0
                                                                )
                                                                .toFixed(0)}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            {stock
                                                                .filter(
                                                                    (s) =>
                                                                        s.station ==
                                                                        station
                                                                )
                                                                .reduce(
                                                                    (
                                                                        acc,
                                                                        curr
                                                                    ) =>
                                                                        acc +
                                                                        +curr.receipt_value,
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            {stock
                                                                .filter(
                                                                    (s) =>
                                                                        s.station ==
                                                                        station
                                                                )
                                                                .reduce(
                                                                    (
                                                                        acc,
                                                                        curr
                                                                    ) =>
                                                                        acc +
                                                                        +curr.to,
                                                                    0
                                                                )
                                                                .toFixed(0)}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Text
                                                            color="light-1"
                                                            style={{
                                                                fontFamily:
                                                                    "serif",
                                                            }}
                                                        >
                                                            {stock
                                                                .filter(
                                                                    (s) =>
                                                                        s.station ==
                                                                        station
                                                                )
                                                                .reduce(
                                                                    (
                                                                        acc,
                                                                        curr
                                                                    ) =>
                                                                        acc +
                                                                        +curr.to_value,
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </Text>
                                                    </TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </Box>
                                </Box>
                            ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default Dashboard;
