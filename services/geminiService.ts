import { GoogleGenAI, Type } from "@google/genai";
import type { ServiceStatus } from '../types';
import { ServiceStatusEnum } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { 
        type: Type.STRING,
        description: 'The name of the cloud service.'
      },
      status: {
        type: Type.STRING,
        enum: [
          ServiceStatusEnum.OPERATIONAL, 
          ServiceStatusEnum.DEGRADED, 
          ServiceStatusEnum.OUTAGE, 
          ServiceStatusEnum.UNKNOWN
        ],
        description: 'The current operational status of the service.'
      },
      summary: { 
        type: Type.STRING,
        description: 'A brief, one-sentence summary of the status or any ongoing incidents.'
      },
      details: {
        type: Type.STRING,
        description: 'A more detailed summary of the current status, including information on any recent incidents. Can be empty if there are no incidents.'
      },
      statusPageUrl: {
        type: Type.STRING,
        description: 'The direct URL to the official status page for the service.'
      },
      history: {
        type: Type.ARRAY,
        description: 'A list of status changes over the last 24 hours. Should be empty if no changes occurred.',
        items: {
          type: Type.OBJECT,
          properties: {
            timestamp: {
              type: Type.STRING,
              description: 'A human-readable timestamp for the event (e.g., "3 hours ago", "2024-07-29 14:00 UTC").'
            },
            status: {
              type: Type.STRING,
              enum: [
                ServiceStatusEnum.OPERATIONAL, 
                ServiceStatusEnum.DEGRADED, 
                ServiceStatusEnum.OUTAGE, 
                ServiceStatusEnum.UNKNOWN
              ],
            },
            description: {
              type: Type.STRING,
              description: 'A brief description of the status change.'
            }
          },
          required: ['timestamp', 'status', 'description']
        }
      },
      subServices: {
        type: Type.ARRAY,
        description: "For 'Microsoft 365', 'Microsoft Azure', 'Atlassian Jira', 'Google Cloud', and 'Salesforce', a list of key components and their statuses. For other services, this should be an empty array.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: 'The name of the sub-service (e.g., "Outlook", "Teams", "Virtual Machines", "Jira Software").'
            },
            status: {
              type: Type.STRING,
              enum: [
                ServiceStatusEnum.OPERATIONAL,
                ServiceStatusEnum.DEGRADED,
                ServiceStatusEnum.OUTAGE,
                ServiceStatusEnum.UNKNOWN
              ],
            }
          },
          required: ['name', 'status']
        }
      }
    },
    required: ['name', 'status', 'summary'],
  },
};


export const fetchServiceStatuses = async (services: string[]): Promise<ServiceStatus[]> => {
  const prompt = `For each of the following cloud services, check their official status page (e.g., status.aws.amazon.com, azure.status.microsoft, etc.) and determine their current operational status. The services are: ${services.join(', ')}.
  
  Respond with a JSON array where each object represents a service. Each object must have the following keys:
  1.  'name': The service name, matching the input exactly.
  2.  'status': One of 'OPERATIONAL', 'DEGRADED', 'OUTAGE', or 'UNKNOWN'.
  3.  'summary': A brief, one-sentence description of the current status. If no incidents, state that all systems are operational.
  4.  'details': A slightly longer summary of any current incidents or recent status changes. If there are no incidents, this can be an empty string or a short confirmation.
  5.  'statusPageUrl': The direct URL to the service's official status page.
  6.  'history': An array of recent status changes in the last 24 hours. If there were no changes, this array should be empty. Each object in the array should contain 'timestamp' (human-readable time), 'status' (the new status), and a brief 'description' of the event.
  7.  'subServices': IMPORTANT - For the 'Microsoft 365', 'Microsoft Azure', 'Atlassian Jira', 'Google Cloud', and 'Salesforce' services, populate this with an array of objects for their key components. For Microsoft 365, use components like Outlook, Teams, SharePoint. For Microsoft Azure, use core services like Virtual Machines, App Service, Azure Storage. For Atlassian Jira, use products like Jira Software, Confluence, Bitbucket. For Google Cloud, use core services like Compute Engine, Cloud Storage, BigQuery. For Salesforce, use products like Sales Cloud, Service Cloud, Marketing Cloud. For all other services, this MUST be an empty array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("Gemini API returned an empty response.");
    }
    
    const parsedResponse = JSON.parse(jsonText);
    
    // Validate that the response is an array
    if (!Array.isArray(parsedResponse)) {
      throw new Error("Invalid response format from Gemini API. Expected an array.");
    }
    
    return parsedResponse as ServiceStatus[];

  } catch (error) {
    console.error("Error fetching or parsing service statuses:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the JSON response from the Gemini API.");
    }
    throw error;
  }
};