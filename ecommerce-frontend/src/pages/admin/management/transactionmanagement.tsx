import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { SkeletonLoader } from "../../../components/Loader";
import { useDeleteOrderMutation, useOrderDetailsQuery, useUpdateOrderMutation } from "../../../redux/api/orderAPI";
import { server } from "../../../redux/store";
import { UserReducerInitialState } from "../../../types/reducer-types";
import { Order, OrderItem } from "../../../types/types";
import { responseToast } from "../../../utils/features";

//Dummy data

// const img ="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8&w=1000&q=804";
// const orderItems: OrderItem[] = [
//   {
//     name: "Puma Shoes",
//     photo: img,
//     id: "asdsaasdas",
//     quantity: 4,
//     price: 2000,
//   },
// ];

const defaultData: Order = {
  shippingInfo: {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
  status: "",
  subtotal: 0,
  discount: 0,
  shippingCharges: 0,
  tax: 0,
  total: 0,
  orderItems: [],
  user: {
    name: "",
    _id: "",
  },
  _id: "",
};

const TransactionManagement = () => {
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitialState }) => state.userReducer
  );
  const params = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useOrderDetailsQuery(params.id!);

  const {
    shippingInfo: { address, city, state, country, pinCode },
    orderItems,
    user: { name },
    status,
    discount,
    tax,
    total,
    subtotal,
    shippingCharges,
  } = data?.order || defaultData;

  // dummy data
  // const [order, setOrder] = useState({
  //   name: "Puma Shoes",
  //   address: "77 black street",
  //   city: "Neyword",
  //   state: "Nevada",
  //   country: "US",
  //   pinCode: 242433,
  //   status: "Processing",
  //   subtotal: 4000,
  //   discount: 1200,
  //   shippingCharges: 0,
  //   tax: 200,
  //   total: 4000 + 200 + 0 - 1200,
  //   orderItems,
  // });

  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const updateHandler = async() => {
    const res = await updateOrder({
      userId: user?._id!,
      orderId:  data?.order._id!,
    });

    responseToast(res, navigate, "/admin/transaction");
  };
  const deleteHandler = async() => {
    const res = await deleteOrder({
      userId: user?._id!,
      orderId:  data?.order._id!,
    });

    responseToast(res, navigate, "/admin/transaction");
  };

  if (isError) return <Navigate to={"/404"} />;
  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {isLoading ? (
          <SkeletonLoader length={20}/>
        ) : (
          <>
            <section
              style={{
                padding: "2rem",
              }}
            >
              <h2>Order Items</h2>

              {orderItems.map((i) => (
                <ProductCard
                  key={i._id}
                  name={i.name}
                  photo={`${server}/${i.photo}`}
                  productId={i.productId}
                  _id={i._id}
                  quantity={i.quantity}
                  price={i.price}
                />
              ))}
            </section>

            <article className="shipping-info-card">
              <button className="product-delete-btn" onClick={deleteHandler}>
                <FaTrash />
              </button>
              <h1>Order Info</h1>
              <h5>User Info</h5>
              <p>Name: {name}</p>
              <p>
                Address:{" "}
                {`${address}, ${city}, ${state}, ${country} ${pinCode}`}
              </p>
              <h5>Amount Info</h5>
              <p>Subtotal: {subtotal}</p>
              <p>Shipping Charges: {shippingCharges}</p>
              <p>Tax: {tax}</p>
              <p>Discount: {discount}</p>
              <p>Total: {total}</p>

              <h5>Status Info</h5>
              <p>
                Status:{" "}
                <span
                  className={
                    status === "Delivered"
                      ? "purple"
                      : status === "Shipped"
                      ? "green"
                      : "red"
                  }
                >
                  {status}
                </span>
              </p>
              <button className="shipping-btn" onClick={updateHandler}>
                Process Status
              </button>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

const ProductCard = ({
  name,
  photo,
  price,
  quantity,
  productId,
}: OrderItem) => (
  <div className="transaction-product-card">
    <img src={photo} alt={name} />
    <Link to={`/product/${productId}`}>{name}</Link>
    <span>
      ₹{price} X {quantity} = ₹{price * quantity}
    </span>
  </div>
);

export default TransactionManagement;
