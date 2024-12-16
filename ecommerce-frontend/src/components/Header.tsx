import React, { useState } from "react";
import { FaSearch, FaShoppingBag, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { User } from "../types/types";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";

// const user = { _id: "", role: "" }; //(No Need of these)

interface PropsType {
  user: User | null;
}

const Header = ({ user } : PropsType) => {

    const[isOpen, setIsOpen] =useState<boolean>(false);

    const logOutHandler = async () => {
        try {
          
          //this signOut and auth both came from the firebase
          await signOut(auth);
          toast.success("Sign Out Successfully");
          setIsOpen(false);
        } catch (error) {
          toast.error("Sign Out fail");
        }
    }
  return (
    <nav className="header">
      <Link onClick={() => setIsOpen(false)} to={"/"}>HOME</Link>
      <Link onClick={() => setIsOpen(false)} to={"/search"}>
        <FaSearch />
      </Link>
      <Link onClick={() => setIsOpen(false)} to={"/cart"}>
        <FaShoppingBag />
      </Link>

      {/* Optional chaining (?.): Safely access properties, preventing errors if user is null or undefined. [Because it was showing error]*/}
      {user?._id ? (
        <>
          <button onClick={() => setIsOpen((prev) => !prev)}>
            <FaUser />
          </button>
          <dialog open={isOpen}>
            <div>
                { user.role === "admin" && (
                    <Link onClick={() => setIsOpen(false)} to ="/admin/dashboard">Admin</Link>
                )}
                <Link onClick={() => setIsOpen(false)} to="/orders">Orders</Link>
                <button onClick={logOutHandler}><FaSignOutAlt/></button>
            </div>
          </dialog>
        </>
      ) : (
        <Link to={"/login"}>
          <FaSignInAlt />
        </Link>
      )}
    </nav>
  );
};

export default Header;
