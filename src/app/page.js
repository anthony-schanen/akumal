"use client"
import { useState } from 'react';
import styles from '@/app/styles/RegexValidation.module.css';

export default function RegexValidation() {
  const [input, setInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateInput = (value) => {
    const pattern = /^(?:\d \d{2} \d{4}\/\d{2}\/\d{2} \d{2}:\d{2}\n?)+$/;
    setIsValid(pattern.test(value));
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInput(value);
    validateInput(value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: input }),
      });
      // Handle response
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
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
        onClick={handleSubmit}
        className={`${styles.submitButton} ${isValid ? styles.enabled : ''}`}
      >
        Submit
      </button>
    </div>
  );
}
