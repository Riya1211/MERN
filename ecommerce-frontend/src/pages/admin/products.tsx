import { ReactElement, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { useAllProductsQuery } from "../../redux/api/productAPI";
import { server } from "../../redux/store";
import toast from "react-hot-toast";
import { CustomError } from "../../types/api-types";
import { useSelector } from "react-redux";
import { UserReducerInitialState } from "../../types/reducer-types";
import { SkeletonLoader } from "../../components/Loader";

interface DataType {
  photo: ReactElement;
  name: string;
  price: number;
  stock: number;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Photo",
    accessor: "photo",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Price",
    accessor: "price",
  },
  {
    Header: "Stock",
    accessor: "stock",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

// const img =
//   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8&w=1000&q=804";

// const img2 = "https://m.media-amazon.com/images/I/514T0SvwkHL._SL1500_.jpg";

//Sample Data
// const arr: Array<DataType> = [
//   {
//     photo: <img src={img} alt="Shoes" />,
//     name: "Puma Shoes Air Jordan Cook Nigga 2023",
//     price: 690,
//     stock: 3,
//     action: <Link to="/admin/product/sajknaskd">Manage</Link>,
//   },

//   {
//     photo: <img src={img2} alt="Shoes" />,
//     name: "Macbook",
//     price: 232223,
//     stock: 213,
//     action: <Link to="/admin/product/sdaskdnkasjdn">Manage</Link>,
//   },
// ];

const Products = () => {
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitialState }) => state.userReducer
  );
  const { data, isLoading, isError, error } = useAllProductsQuery(user?._id!); //add "!" at last means not null operator it means we know that if anyone is accessing the page user will be there
  const [rows, setRows] = useState<DataType[]>([]);

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  useEffect(() => {
    if (data) {
      // maping the data because they data types are bit diff
      setRows(
        data.products.map((i) => ({
          photo: <img src={`${server}/${i.photo}`} />,
          name: i.name,
          price: i.price,
          stock: i.stock,
          action: <Link to={`/admin/product/${i._id}`}>Manage</Link>,
        }))
      );
    }
  }, [data]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "dashboard-product-box",
    "Products",
    rows.length > 6
  )();

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>{isLoading ? <SkeletonLoader length={20} /> : Table}</main>
      <Link to="/admin/product/new" className="create-product-btn">
        <FaPlus />
      </Link>
    </div>
  );
};

export default Products;
