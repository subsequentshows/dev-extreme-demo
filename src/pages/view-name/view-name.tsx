import React from "react";
import "./view-name.scss";

export default () => {
  console.log("123");
  return (
    <React.Fragment>
      <h2 className={"content-block"}>View Name</h2>
      <div className={"content-block"}>
        <div className={"dx-card responsive-paddings"}>
          Put your content here
        </div>
      </div>
    </React.Fragment>
  );
};
