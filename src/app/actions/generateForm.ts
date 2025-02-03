"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { saveForm } from "./mutateForm";
import OpenAI from "openai";  // Import OpenAI client for GPT-4o

export async function generateForm(
  prevState: {
    message: string;
  },
  formData: FormData
) {
  const schema = z.object({
    description: z.string().min(1),
  });
  const parse = schema.safeParse({
    description: formData.get("description"),
  });

  if (!parse.success) {
    console.log(parse.error);
    return {
      message: "Failed to parse data",
    };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return {
      message: "No GitHub API key found",
    };
  }

  const data = parse.data;
  const promptExplanation =
    "Based on the description, generate a survey object with 3 fields: name(string) for the form, description(string) of the form and a questions array where every element has 2 fields: text and the fieldType and fieldType can be of these options RadioGroup, Select, Input, Textarea, Switch; and return it in json format. For RadioGroup, and Select types also return fieldOptions array with text and value fields. For example, for RadioGroup, and Select types, the field options array can be [{text: 'Yes', value: 'yes'}, {text: 'No', value: 'no'}] and for Input, Textarea, and Switch types, the field options array can be empty. For example, for Input, Textarea, and Switch types, the field options array can be []";

  try {
    console.log("Starting API request...");

    // Initialize OpenAI client with the GitHub GPT-4o API token
    const client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",  // Use the correct base URL for GitHub GPT-4o API
      apiKey: token,
    });

    // Make API request to GitHub GPT-4o model
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: `${data.description} ${promptExplanation}` }, // Add promptExplanation
      ],
      model: "gpt-4o",  // Use GPT-4o model
      temperature: 1,
      max_tokens: 4096,
      top_p: 1,
    });

    

    // Check if the response contains valid content
    if (!response?.choices?.[0]?.message?.content) {
      return {
        message: "Invalid or empty response from API",
      };
    }

    // Extract the response content
    let responseContent = response.choices[0].message.content;

    // Remove markdown syntax (```json and ```
    const jsonString = responseContent.replace(/^```json\s*|\s*```$/g, '').trim();

    // Safely parse the stripped JSON string
    let responseObj;
    try {
      responseObj = JSON.parse(jsonString);
      console.log("Parsed response object:", responseObj);
    } catch (err) {
      console.error("Error parsing response:", err);
      return {
        message: "Error parsing response from API",
      };
    }

    // Save the form to the database
    const dbFormId = await saveForm({
      name: responseObj.name,
      description: responseObj.description,
      questions: responseObj.questions,
    });

    revalidatePath("/");

    return {
      message: "success",
      data: { formId: dbFormId },
    };
  } catch (e) {
    console.error("An error occurred:", e);
    return {
      message: "Failed to create form",
    };
  }
}
