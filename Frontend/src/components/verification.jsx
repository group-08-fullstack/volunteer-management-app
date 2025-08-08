import React, { useState } from 'react';
import {register, verifyEmail,confirmCode} from '../helpers/authHelpers';
import { data } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


export default function VerificationInput({email, showVerification, setshowVerification}) {
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();


  const handleSubmit = async () => {
    if (inputValue.trim() === '') return;

    const data = {
        "email" : email,
        "code" : parseInt(inputValue)
    }

    const confirm_result = await confirmCode(data); // Check with server

    if (confirm_result) {
            navigate("/login");
          }

    else{
        alert('Incorrect verfication code');
    }
  };

  const handleCancel = () => {
    setshowVerification(false);
  };



  return (

    <>

        <style>
        {`
        .verification-container {
            padding: 16px;
            background-color: #fff;
            border: 1px solid #ccc;
            width: 300px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .verification-input {
            width: 100%;
            padding: 8px;
            margin-bottom: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .verification-buttons {
            display: flex;
            justify-content: space-between;
        }

        .verification-cancel,
        .verification-submit {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .verification-cancel {
            background-color: #ddd;
        }

        .verification-submit {
            background-color: #4caf50;
            color: white;
        }
        `}
    </style>
        <div className="verification-container">
        <input
            type="text"
            className="verification-input"
            placeholder="Enter verification code"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
        />
        <div className="verification-buttons">
            <button
            onClick={handleCancel}
            className="verification-cancel"
            >
            Cancel
            </button>
            <button
            onClick={handleSubmit}
            className="verification-submit"
            >
            Submit
            </button>
        </div>
        </div>

    </>
  );
}