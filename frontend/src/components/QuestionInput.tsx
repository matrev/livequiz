// pull quiz data from the server and display it
'use client'

import { Question, Quiz } from "@/generated/graphql";
import { useState } from "react";

export default function QuestionInput() {

    return (
        <div>
            <label htmlFor="QuestionName">Enter the Question:</label>
            <input
                type="text"
                name="QuestionName"
                id="QuestionName"
            />
        </div>
    );
}