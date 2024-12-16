import { ChangeEvent, useState } from "react"
import { BiArrowBack } from "react-icons/bi"
import { useNavigate } from "react-router-dom"

const Shipping = () => {

    const [shippingInfo, setShippingInfo] = useState({
        address: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
    })

    const changeHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShippingInfo((prev) => ({...prev, [e.target.name]: e.target.value}))
    }

    // For Navigation
    const navigate = useNavigate();
  return (
    <div className="shipping">
        <button className="backBtn" onClick={() =>  navigate("/cart")}><BiArrowBack /></button>

        <form>
            <h1>Shipping Address</h1>
            <input required type="text" name="address" placeholder="Address" value={shippingInfo.address} onChange={changeHandler} />
            <input required type="text" name="city" placeholder="City" value={shippingInfo.city} onChange={changeHandler} />
            <input required type="text" name="state" placeholder="State" value={shippingInfo.state} onChange={changeHandler} />

            <select required name="country" value={shippingInfo.country} onChange={changeHandler}>
                <option value="">Choose Country</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
            </select>
            <input required type="number" name="pinCode" placeholder="Pin Code" value={shippingInfo.pinCode} onChange={changeHandler} />
            <button type="submit">Pay Now</button>
        </form>
    </div>
  )
}

export default Shipping