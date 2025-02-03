import { FaPlus } from "react-icons/fa";
import { server } from "../redux/store";

type ProductProps = {
  productId: string;
  photo: string;
  name:string;
  price:number;
  stock: number;
  handler: () => void;
}

// Dummy Server for photo
// const server = "asdhnvcmklo";

const ProductCard = ({productId, photo, name, price, stock, handler} : ProductProps) => {
  return (
     <div className="productCard">
      {/* won't be using photo directly as we are using photo from backend */}
      <img src={`${server}/${photo}`} alt={name} />
      <p>{name}</p>
      <span>₹{price}</span>

      <div>
        <button onClick={() => handler()}><FaPlus /></button>
      </div>
     </div>
  )
}

export default ProductCard