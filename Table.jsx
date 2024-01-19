import PropTypes from "prop-types";

const Table = ({ transactions }) => {
  return (
    <>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          maxWidth: "1100px",
          margin: "auto",
          marginTop: "20px",
        }}
      >
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th style={tableHeaderStyle}>ID</th>
            <th style={tableHeaderStyle}>Title</th>
            <th style={tableHeaderStyle}>Description</th>
            <th style={tableHeaderStyle}>Price</th>
            <th style={tableHeaderStyle}>Category</th>
            <th style={tableHeaderStyle}>Sold</th>
            <th style={tableHeaderStyle}>Image</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              return (
                <tr
                  key={transaction._id}
                  style={{ borderBottom: "1px solid #ddd" }}
                >
                  <td style={tableCellStyle}>{transaction.id}</td>
                  <td style={tableCellStyle}>{transaction.title}</td>
                  <td style={tableCellStyle}>{transaction.description}</td>
                  <td style={tableCellStyle}>{transaction.price}</td>
                  <td style={tableCellStyle}>{transaction.category}</td>
                  <td
                    style={{
                      ...tableCellStyle,
                      color: transaction.sold ? "green" : "red",
                    }}
                  >
                    {transaction.sold ? "Yes" : "No"}
                  </td>
                  <td style={tableCellStyle}>
                    {transaction.image && (
                      <img
                        src={transaction.image}
                        alt="Product"
                        style={{ maxWidth: "80px", maxHeight: "80px" }}
                      />
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
      
    </>
  );
};

const tableHeaderStyle = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
  padding: "10px",
  textAlign: "left",
};


Table.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      image: PropTypes.string,
      sold: PropTypes.bool.isRequired,
      dateOfSale: PropTypes.string,
    })
  ).isRequired,
};

export default Table;
