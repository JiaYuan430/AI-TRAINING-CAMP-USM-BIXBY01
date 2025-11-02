
import { GoogleGenAI, Type } from "@google/genai";
import { PredictionFeatures } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function predictDeliveryTime(
  newOrder: PredictionFeatures,
  historicalDataCSV: string
): Promise<number> {

  const prompt = `
You are an expert data scientist specializing in logistics and delivery time prediction. Your task is to act as a regression model.
I will provide you with a dataset of past delivery orders and the features of a new order.
Based on the patterns in the dataset, you must predict the 'Delivery_time_min' for the new order.

Here is the historical delivery data in CSV format:
"""
${historicalDataCSV}
"""

Based on the patterns in the data above, predict the 'Delivery_time_min' for the following new order:
- 地址: ${newOrder['地址']}
- 数量: ${newOrder['数量']}
- A: ${newOrder.A}
- B: ${newOrder.B}
- C: ${newOrder.C}
- D: ${newOrder.D}
- E: ${newOrder.E}
- F: ${newOrder.F}
- G: ${newOrder.G}
- A1: ${newOrder.A1}
- A2: ${newOrder.A2}
- A3: ${newOrder.A3}
- A4: ${newOrder.A4}
- Distance_km: ${newOrder.Distance_km}
- Traffic_factor: ${newOrder.Traffic_factor}
- Weight_kg: ${newOrder.Weight_kg}

Your output MUST be a single, valid JSON object in the format: {"predicted_time": <value>}. Do not include any other text, markdown formatting, or explanations.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          predicted_time: {
            type: Type.NUMBER,
          },
        },
      },
      temperature: 0.1 // Lower temperature for more deterministic, regression-like output
    }
  });

  try {
    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    if (typeof result.predicted_time === 'number') {
      return result.predicted_time;
    }
    throw new Error('Invalid JSON response structure from API.');
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Could not get a valid prediction from the AI model.");
  }
}
