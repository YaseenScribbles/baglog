import {
    Box,
    Button,
    DateInput,
    FormField,
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
import { Search } from "grommet-icons";

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
                        columns={"18%"}
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
                                    <Box width={"100%"} overflow={{ horizontal: "auto" }} >
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
                                                            O
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
                                                            C
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
                                                            S
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
                                                                            +e.from -
                                                                            +e.to
                                                                        ).toFixed(
                                                                            0
                                                                        )}
                                                                    </Text>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                            </TableBody>
                                            <TableFooter style={{ borderTop: "2px solid #fff" }}>
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
                                                                        (+curr.from -
                                                                            +curr.to),
                                                                    0
                                                                )
                                                                .toFixed(0)}
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
