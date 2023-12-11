import React from "react";

// import { Button } from "baseui/button";
// import { Input } from "baseui/input";
// import styled from "styled-components";
// import {
//   HeadingXXLarge,
//   HeadingXLarge,
//   HeadingLarge,
//   HeadingMedium,
//   HeadingSmall,
//   HeadingXSmall,
// } from "baseui/typography";
// import {
//   Container,
//   ErrorText,
//   InnerContainer,
//   InputWrapper,
//   StyledInput,
// } from "../commons";

import { useSignIn } from "react-auth-kit";
import { useFormik } from "formik";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginForm(props) {
  const [error, setError] = useState("");
  const signIn = useSignIn();

  const onSubmit = async (values) => {
    console.log("Values: ", values);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:9000/api/v1/login",
        values
      );

      signIn({
        token: response.data.token,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: { email: values.email },
      });
    } catch (err) {
      if (err && err instanceof AxiosError)
        setError(err.response?.data.message);
      else if (err && err instanceof Error) setError(err.message);

      console.log("Error: ", err);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit,
  });

  return (
    <div>
      <div>
        <form onSubmit={formik.handleSubmit}>
          <h2>Welcome Back!</h2>
          <p>{error}</p>
          <input>
            <input
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder="Email"
              clearOnEscape
              size="large"
              type="email"
            />
          </input>
          <input>
            <input
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              placeholder="Password"
              clearOnEscape
              size="large"
              type="password"
            />
          </input>
          <input>
            <button size="large" kind="primary" isLoading={formik.isSubmitting}>
              Login
            </button>
          </input>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;