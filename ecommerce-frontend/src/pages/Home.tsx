import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useLatestProductsQuery } from "../redux/api/productAPI";
import toast from "react-hot-toast";
import { SkeletonLoader } from "../components/Loader";

const Home = () => {
  const { data, isLoading, isError } = useLatestProductsQuery("");
  const addToCartHandler = () => {};

  if(isError){
    toast.error("Cannot Fetch the Products")
  }
  return (
    <div className="home">
      <section></section>
      <h1>
        Latest Products
        <Link to="/search" className="findMore">
          More
        </Link>
      </h1>

      <main>
        {/* <ProductCard productId='1' photo='https://images.unsplash.com/photo-1420406676079-b8491f2d07c8?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' name='Macbook' price={159999} stock={12} handler={addToCartHandler}/> */}
        {isLoading? <SkeletonLoader width="80vw"/> : data?.products.map((i) => (
          <ProductCard
            key={i._id}
            productId={i._id}
            photo={i.photo}
            name={i.name}
            price={i.price}
            stock={i.stock}
            handler={addToCartHandler}
          />
        ))}
      </main>
    </div>
  );
};

export default Home;
