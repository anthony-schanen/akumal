"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import styles from "./styles/RegexValidation.module.css";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [isValid, setIsValid] = useState(false);
  const { data: session, status } = useSession();
  const [inputStatus, setInputStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission

  useEffect(() => {
    // Check if there is stored data after authentication
    if (status === "authenticated") {
      const storedInput = localStorage.getItem("inputData");
      if (storedInput) {
        submitData(storedInput);
        localStorage.removeItem("inputData");
      }
    }
  }, [status]);

  const validateInput = (value) => {
    const pattern = /^(?:[A-Z0-9]{3} \d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\n?)+$/;
    const inputValidity = pattern.test(value);
    setIsValid(inputValidity);
    setInputStatus(inputValidity ? "Format OK" : "");
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
      localStorage.setItem("inputData", input);
      signIn("zoho");
    } else {
      submitData(input);
    }
  };

  const submitData = async (dataToSubmit) => {
    setIsSubmitting(true);
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

      alert("Data submitted successfully!");
      console.log("Rows added:", result.data);
      setInput("");
      setIsValid(false);
      setInputStatus("");
    } catch (error) {
      console.error("Error adding rows:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.outerContainer}>
      <div className={styles.container}>
        <p className={styles.validStatus}>{inputStatus}</p>
        <textarea
          id="inputField"
          placeholder="Enter data"
          value={input}
          onChange={handleInputChange}
          className={styles.inputField}
        ></textarea>
        {isSubmitting ? (
          <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
        </div>
        ) : (
          <button
            id="submitButton"
            disabled={!isValid}
            className={`${styles.submitButton} ${isValid ? styles.enabled : ""}`}
            onClick={handleClick}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
