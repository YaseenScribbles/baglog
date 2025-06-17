import {
    Box,
    Button,
    DateInput,
    Grid,
    Heading,
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
import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { format, startOfMonth } from "date-fns";
import { Nodes, Search, Download } from "grommet-icons";
import * as XLSX from "xlsx";

const Dashboard = (props) => {
    const [stations, setStations] = useState([]);
    const [stock, setStock] = useState([]);
    const { data, setData, get, processing } = useForm({
        from_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        to_date: format(new Date(), "yyyy-MM-dd"),
    });
    const [headerHeight, setHeaderHeight] = useState(0);

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
            only: ["stock"],
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
                "Curr. Qty",
                "Curr. Value",
                "Del. Qty",
                "Del. Value",
            ];

            const filtered = stock.filter((s) => s.station === station);

            const rows = filtered.map((e) => [
                e.product.toUpperCase(),
                (+e.from).toFixed(0),
                (+e.from * +e.cost_price).toFixed(2),
                (+e.to).toFixed(0),
                (+e.to * +e.cost_price).toFixed(2),
                (+e.from - +e.to).toFixed(0),
                ((+e.from - +e.to) * +e.cost_price).toFixed(2),
            ]);

            // Footer totals
            const totals = filtered.reduce(
                (acc, curr) => {
                    acc[0] += +curr.from;
                    acc[1] += +curr.from * +curr.cost_price;
                    acc[2] += +curr.to;
                    acc[3] += +curr.to * +curr.cost_price;
                    acc[4] += +curr.from - +curr.to;
                    acc[5] += (+curr.from - +curr.to) * +curr.cost_price;
                    return acc;
                },
                [0, 0, 0, 0, 0, 0]
            );

            const footerRow = [
                "Total",
                totals[0].toFixed(0),
                totals[1].toFixed(2),
                totals[2].toFixed(0),
                totals[3].toFixed(2),
                totals[4].toFixed(0),
                totals[5].toFixed(2),
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
            />
            {headerHeight && (
                <Box
                    height={`calc(100% - ${headerHeight}px)`}
                    overflow={{ vertical: "auto" }}
                >
                    <Grid
                        gap={"small"}
                        rows={["70px", "auto"]}
                        columns={"45%"}
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
                                                                        size="xsmall"
                                                                    >
                                                                        {e.product.toUpperCase()}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size="xsmall"
                                                                    >
                                                                        {(+e.from).toFixed(
                                                                            0
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size="xsmall"
                                                                    >
                                                                        {(
                                                                            +e.from *
                                                                            +e.cost_price
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size="xsmall"
                                                                    >
                                                                        {(+e.to).toFixed(
                                                                            0
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size="xsmall"
                                                                    >
                                                                        {(
                                                                            +e.to *
                                                                            +e.cost_price
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size="xsmall"
                                                                    >
                                                                        {(
                                                                            +e.from -
                                                                            +e.to
                                                                        ).toFixed(
                                                                            0
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Text
                                                                        color="light-1"
                                                                        size="xsmall"
                                                                    >
                                                                        {(
                                                                            (+e.from -
                                                                                +e.to) *
                                                                            +e.cost_price
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
                                                                        +curr.from *
                                                                            +curr.cost_price,
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
                                                                        +curr.to *
                                                                            +curr.cost_price,
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
                                                                        (+curr.from -
                                                                            +curr.to),
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
                                                                        (+curr.from -
                                                                            +curr.to) *
                                                                            +curr.cost_price,
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
