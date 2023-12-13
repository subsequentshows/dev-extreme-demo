import { Link } from "react-router-dom";
import User from "../user/user";
const Admin = () => {
  return (
    <section>
      <h1>Admins Page</h1>
      <br />
      <p>You must have been assigned an Admin role.</p>
      <User />
      <div className="flexGrow">
        <Link to="/">Home</Link>
      </div>
    </section>
  )
}

export default Admin