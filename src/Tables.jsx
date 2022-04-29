const Table = ({children}) => (
  <div className="main-table">{children}</div>
);

Table.Header = ({children}) => (
  <div className="main-table__head">{children}</div>
);

Table.Body = ({children}) => (
  <div className="main-table__body">{children}</div>
);

Table.Row = ({children}) => (
  <div className="main-table__row">{children}</div>
);

Table.Cell = ({className, children}) => (
  <div className="main-table__column">
    <span className={`main-table__text ${className}`}>{children}</span>
  </div>
);

export default Table;
