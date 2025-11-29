import * as XLSX from 'xlsx';
import { CSVLink } from 'react-csv';

// ** Export using xlsx format
export const ExportExcel = (data, filename) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ** Export using csv format
export const ExportCSV = ({ data, filename, children }) => {
  return (
    <CSVLink data={data} filename={`${filename}.csv`}>
      {children}
    </CSVLink>
  );
};