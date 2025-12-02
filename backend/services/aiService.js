import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const parseRFPInput = async (naturalLanguageInput) => {
  try {
    const prompt = `You are an expert at parsing procurement requirements into structured data.

Parse this RFP request into JSON:
"${naturalLanguageInput}"

Extract:
- title (brief summary of the RFP)
- description (detailed description)
- items (array of {item_type, quantity, specifications})
- budget (number only, no currency symbols)
- deadline (date string in YYYY-MM-DD format, if mentioned)
- payment_terms (extract payment terms if mentioned)
- warranty_requirement (extract warranty requirements if mentioned)
- any other relevant terms

Return ONLY valid JSON with no additional text or markdown. The response must be parseable JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a procurement expert that converts natural language into structured JSON data. Always return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    let jsonString = content;
    if (content.startsWith('```json')) {
      jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.startsWith('```')) {
      jsonString = content.replace(/```\n?/g, '');
    }

    const parsedData = JSON.parse(jsonString);
    return parsedData;
  } catch (error) {
    console.error('Error parsing RFP with AI:', error);
    throw new Error(`Failed to parse RFP: ${error.message}`);
  }
};

export const parseProposal = async (emailContent, rfpData) => {
  try {
    const rfpItemsJson = JSON.stringify(rfpData.items, null, 2);

    const prompt = `You are an expert at extracting pricing and terms from vendor proposals.

Parse this vendor proposal email:
"${emailContent}"

For this RFP with items:
${rfpItemsJson}

Extract:
- vendor_name (if mentioned)
- line_items (array matching RFP items with {item_type, quantity, unit_price, total_price, notes})
- total_price (number only, overall total)
- delivery_timeline (when they can deliver)
- payment_terms_offered (their payment terms)
- warranty_offered (warranty they're providing)
- additional_terms (any other important information)

Return ONLY valid JSON with no additional text or markdown.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a procurement expert that extracts structured data from vendor proposals. Always return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    let jsonString = content;
    if (content.startsWith('```json')) {
      jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.startsWith('```')) {
      jsonString = content.replace(/```\n?/g, '');
    }

    const parsedData = JSON.parse(jsonString);
    return parsedData;
  } catch (error) {
    console.error('Error parsing proposal with AI:', error);
    throw new Error(`Failed to parse proposal: ${error.message}`);
  }
};

export const compareProposals = async (rfpData, proposals) => {
  try {
    const rfpJson = JSON.stringify({
      title: rfpData.title,
      budget: rfpData.budget,
      deadline: rfpData.deadline,
      items: rfpData.items,
      payment_terms: rfpData.payment_terms,
      warranty_requirement: rfpData.warranty_requirement
    }, null, 2);

    const proposalsJson = JSON.stringify(proposals.map(p => ({
      vendor_name: p.vendor_name,
      vendor_id: p.vendor_id,
      total_price: p.total_price,
      delivery_timeline: p.delivery_timeline,
      payment_terms_offered: p.payment_terms_offered,
      warranty_offered: p.warranty_offered,
      line_items: p.line_items
    })), null, 2);

    const prompt = `You are a procurement expert helping compare vendor proposals.

Compare these proposals for RFP "${rfpData.title}":

RFP Requirements:
${rfpJson}

Proposals:
${proposalsJson}

Provide:
1. scores - Array of objects with vendor_id and scores (0-100) for:
   - price_score (how competitive is the price vs budget)
   - terms_score (how favorable are payment and warranty terms)
   - completeness_score (did they respond to all items)
   - delivery_score (how well does delivery timeline match)
   - overall_score (weighted average)
2. comparison_summary (brief overview of key differences)
3. recommendation (which vendor_id to choose and clear reasoning)
4. risks (any concerns or missing information for each vendor)

Return ONLY valid JSON with this structure:
{
  "scores": [{"vendor_id": 1, "price_score": 85, "terms_score": 90, "completeness_score": 100, "delivery_score": 80, "overall_score": 88}],
  "comparison_summary": "string",
  "recommendation": {"vendor_id": 1, "reasoning": "string"},
  "risks": [{"vendor_id": 1, "concerns": ["string"]}]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a procurement expert that analyzes and compares vendor proposals objectively. Always return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    const content = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    let jsonString = content;
    if (content.startsWith('```json')) {
      jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.startsWith('```')) {
      jsonString = content.replace(/```\n?/g, '');
    }

    const analysisData = JSON.parse(jsonString);
    return analysisData;
  } catch (error) {
    console.error('Error comparing proposals with AI:', error);
    throw new Error(`Failed to compare proposals: ${error.message}`);
  }
};
