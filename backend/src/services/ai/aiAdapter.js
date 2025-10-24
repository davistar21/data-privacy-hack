// aiAdapter.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { randomUUID } from 'crypto';

export class AIAdapter {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.cache = new Map();
    this.cannedResponses = this.initializeCannedResponses();
  }

   async generateAudit(revocationEvent, options = {}) {
      console.log('API key: '+process.env.GEMINI_API_KEY);
      const {
        timeout = 1500,
        maxRetries = 1,
        useCache = true
      } = options;
      const auditId = randomUUID(); // Assuming you've imported Node's crypto or similar
      const { id, orgId, userId } = revocationEvent;
      // Check cache for identical recent events (2-minute window)
      const cacheKey = `${revocationEvent.userId}-${revocationEvent.orgId}-${revocationEvent.purpose}`;
      const now = Date.now();
      
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (now - cached.timestamp < 120000) { // 2 minutes
          console.log(`Using cached AI response for ${cacheKey}`);
          return { ...cached.response, source: 'cached' };
        }
      }

      // Try LLM call with timeout and retries
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`AI call attempt ${attempt + 1} for ${revocationEvent.id}`);
          
          const prompt = this.getPromptTemplate(revocationEvent);
          const aiPromise = this.model.generateContent(prompt);
          
          const response = await Promise.race([
            aiPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('AI timeout')), timeout)
            )
          ]);

          if (response && response.response) {
            const text = response.response.text();
            const cleanText = text.replace(/```json|```/g, '').trim();
            
            if (this.validateAIResponse(cleanText)) {


              const aiResult = JSON.parse(cleanText);
             // Map AI result to the final database schema
              const result = {
                id: auditId, // New UUID for the audit log
                revocationId: id,
                orgId: orgId,
                userId: userId,
                auditText: aiResult.auditText,
                // Convert array to string for 'TEXT' column, or ensure DB schema is JSONB/TEXT
                recommendation: JSON.stringify(aiResult.recommendation), 
                legalReferences: JSON.stringify(aiResult.legalReferences),
                status: 'pending', // Initial status
                generatedAt: new Date().toISOString(),
                signature: 'PLACEHOLDER_FOR_HMAC', // **CRITICAL: Must be generated here**
                source: 'ai',
                attempt: attempt + 1,
              };
              
              // Cache successful response
              this.cache.set(cacheKey, {
                response: result,
                timestamp: now
              });
              
              return result;
            }
          }
        } catch (error) {
          console.log(`AI attempt ${attempt + 1} failed:`, error.message);
          
          if (attempt === maxRetries) {
            console.log('All AI attempts failed, using canned response');
            const cannedResponse = this.generateCannedResponse(revocationEvent);
            
            // Cache canned response too
            this.cache.set(cacheKey, {
              response: cannedResponse,
              timestamp: now
            });
            
            return cannedResponse;
          }
        }
      }
  }

  initializeCannedResponses() {
    return {
      marketing: {
        auditText: "User {userName} ({userId}) requested revocation of marketing consent for fields {fields} on {timestamp}. Revocation logged and acknowledged. No further marketing communications should be sent pending deletion or anonymization in accordance with NDPR principles.",
        recommendation: [
          "Mark contact as 'marketing_opted_out' in CRM system",
          "Queue deletion of marketing-only PII after retention policy review",
          "Log confirmation to user within 7 days as per internal policy"
        ],
        legalReferences: ["NDPR - Consent and withdrawal (Article: Consent)"]
      },
      biometric: {
        auditText: "User {userName} ({userId}) revoked consent for biometric data processing on {timestamp}. All biometric identifiers including {fields} must be securely erased from active systems and backups following NDPR requirements for sensitive data.",
        recommendation: [
          "Immediately disable biometric authentication for user",
          "Schedule secure deletion of biometric templates from all databases",
          "Notify security team and DPO of biometric data removal"
        ],
        legalReferences: ["NDPR - Processing of Special Categories of Data"]
      },
      customer_service: {
        auditText: "User {userName} ({userId}) modified consent for customer service data processing on {timestamp}. Core service data retention permitted under legitimate interest basis, but restricted from secondary uses as per NDPR Article 6.",
        recommendation: [
          "Maintain data in restricted service-only database",
          "Review and update data access permissions",
          "Ensure data not used for analytics or marketing purposes"
        ],
        legalReferences: ["NDPR - Lawful Basis for Processing (Legitimate Interest)"]
      },
      default: {
        auditText: "User {userName} ({userId}) revoked consent for {purpose} processing involving fields {fields} on {timestamp}. Organization must comply with data subject rights under NDPR and update processing activities accordingly.",
        recommendation: [
          "Review specific data processing activities for {purpose}",
          "Update consent records and processing logs",
          "Confirm compliance with data protection officer"
        ],
        legalReferences: ["NDPR - Data Subject Rights"]
      }
    };
  }

  getPromptTemplate(revocationEvent) {
    // Extract key data from the event for the prompt
    const eventDetails = JSON.stringify(revocationEvent, null, 2);
    return `
        You are a compliance assistant specialized in the Nigerian Data Protection Regulation (NDPR). Given a revocation event, produce a short NDPR-compliant audit entry and an actionable next steps list. Output must be valid JSON only (no additional text).

        Revocation Event:
        ${eventDetails}

        Task:
        1) Produce an "auditText" (80-140 words) documenting the event and referencing NDPR obligations
        2) Produce "recommendation" array of practical next steps the org should take
        3) Include "legalReferences" array with relevant NDPR sections
        4) Output ONLY JSON in this exact format:
        {
          "auditText": "string_detailed_description_of_audit_event",
          "recommendation": ["step 1", "step 2", "step 3"],
          "legalReferences": ["reference 1", "reference 2"]
        }
        `;
  }

  generateCannedResponse(revocationEvent) {
    // Use simple fallback placeholders if data is structured differently
    const userName = revocationEvent.userName || revocationEvent.userId; // Assuming you have a userName or just use the ID
    const fieldsString = Array.isArray(revocationEvent.fields) 
      ? revocationEvent.fields.join(', ')
      : revocationEvent.fields;
      
    const template = this.cannedResponses[revocationEvent.purpose] || this.cannedResponses.default;

    let auditText = template.auditText
      .replace(/{userName}/g, userName)
      .replace(/{userId}/g, revocationEvent.userId)
      .replace(/{fields}/g, fieldsString)
      .replace(/{timestamp}/g, new Date(revocationEvent.requestedAt).toISOString())
      .replace(/{purpose}/g, revocationEvent.purpose);

    // Return the data structure that matches the final output from generateAudit
    return {
      id: randomUUID(),
      revocationId: revocationEvent.id,
      orgId: revocationEvent.orgId,
      userId: revocationEvent.userId,
      auditText: auditText,
      // Convert array to string
      recommendation: JSON.stringify(template.recommendation),
      legalReferences: JSON.stringify(template.legalReferences),
      status: 'pending',
      generatedAt: new Date().toISOString(),
      signature: 'PLACEHOLDER_FOR_HMAC', // **CRITICAL: Must be generated here**
      source: 'canned'
    };
  }

  validateAIResponse(response) {
    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      return (
        parsed &&
        typeof parsed.auditText === 'string' &&
        Array.isArray(parsed.recommendation) &&
        Array.isArray(parsed.legalReferences)
      );
    } catch {
      return false;
    }
  }

  

  // Utility method to clear cache (useful for testing)
  clearCache() {
    this.cache.clear();
  }

  // Get cache statistics (useful for monitoring)
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
let aiAdapterInstance = null;

export function getAIAdapter() {
  if (!aiAdapterInstance) {
    aiAdapterInstance = new AIAdapter();
  }
  return aiAdapterInstance;
}

