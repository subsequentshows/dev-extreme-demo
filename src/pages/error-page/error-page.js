// import React from "react";

// const ErrorPage = () => {
//   return (
//     <>
//       <div className="responsive-paddings">
//         <h5>Trang không tồn tại</h5>
//       </div>
//     </>
//   )
// }

// export default ErrorPage;

import React, { useState } from "react";

const ErrorPage = () => {
  const [tenXaSearch, setTenXaSearch] = useState("");

  const onTenXaValueChanged = ({ target: { value } }) => {
    console.log("Current tenXaSearch value:", tenXaSearch);
    console.log("New value from input:", value);

    setTenXaSearch(value);
  };

  return (
    <input
      type='text'
      className='ship-country-filter search-input'
      value={tenXaSearch}
      onChange={onTenXaValueChanged}
      placeholder='Search...'
    />
  );
};

export default ErrorPage;