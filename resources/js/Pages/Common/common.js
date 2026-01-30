import * as XLSX from "xlsx";

export const excelExport = (data, name) => {
    if (!Array.isArray(data) || data.length === 0) {
        console.warn("No data to export.");
        return;
    }

    const formattedData = data.map((row) => {
        const newRow = {};
        Object.entries(row).forEach(([key, value]) => {
            const formattedKey = key.replace(/_/g, " ").toUpperCase();
            newRow[formattedKey] = value;
        });
        return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, name.split(" ")[0]);

    XLSX.writeFile(workbook, name + ".xlsx");
};

export const getColorByProductType = (productType) => {
    switch (productType.toLowerCase()) {
        case "accessory":
            return "light-1";
        case "gift":
            return "accent-1";
        default:
            return "neutral-1";
    }
};
