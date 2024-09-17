import React from 'react';

interface TableProps {
  headers: string[];
  data: Record<string, string>[];
  underlineColumn: string; // Name of the column to be underlined
  handleClick: (value: string) => void; // Function to handle click on the underlined column
}

const Table: React.FC<TableProps> = ({ headers, data, underlineColumn, handleClick }) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                    header.toLowerCase() === underlineColumn.toLowerCase() ? 'underline cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (header.toLowerCase() === underlineColumn.toLowerCase()) {
                      handleClick(row[header]);
                    }
                  }}
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
