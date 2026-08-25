"use client";
import React from 'react'
import { useEffect } from "react";

const Chatbot = () => {

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://fullaisupport.com/widget.js";
        script.async = true;
        script.setAttribute("data-api-key", "sp_bot_key_2v000twding");
        document.body.appendChild(script);

        return () => {
            script.remove();
        };
    }, []);

    return null;
}

export default Chatbot