"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import styles from "./styles/RegexValidation.module.css";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [isValid, setIsValid] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check if there is stored data after authentication
    if (status === "authenticated") {
      const storedInput = localStorage.getItem("inputData");
      if (storedInput) {
        // Submit the data
        submitData(storedInput);
        // Clear the stored data
        localStorage.removeItem("inputData");
      }
    }
  }, [status]);

  const validateInput = (value) => {
    const pattern = /^(?:\d \d{2} \d{4}\/\d{2}\/\d{2} \d{2}:\d{2}\n?)+$/;
    setIsValid(pattern.test(value));
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInput(value);
    validateInput(value);
  };

  const handleClick = async () => {
    if (!isValid) {
      alert("Please enter valid data.");
      return;
    }

    if (!session) {
      // Store the input data before authentication
      localStorage.setItem("inputData", input);
      // Initiate sign-in and redirect back to the same page
      signIn("zoho");
    } else {
      submitData(input);
    }
  };

  const submitData = async (dataToSubmit) => {
    try {
      const response = await fetch("/api/addRow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: dataToSubmit }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        const errorMessage = result.error || "Unknown error";
        throw new Error(errorMessage);
      }

      console.log("Rows added:", result.data);
      setInput("");
      setIsValid(false);
    } catch (error) {
      console.error("Error adding rows:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className={styles.outerContainer}>
      <div className={styles.container}>
        <textarea
          id="inputField"
          placeholder="Enter data"
          value={input}
          onChange={handleInputChange}
          className={styles.inputField}
        ></textarea>
        <button
          id="submitButton"
          disabled={!isValid}
          className={`${styles.submitButton} ${isValid ? styles.enabled : ""}`}
          onClick={handleClick}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
