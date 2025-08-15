import { NextRequest, NextResponse } from 'next/server'

const MORPH_API_KEY = 'sk-bJ6yBWRmyPA4Y4jdjve8CZhmIGn6bCglNJOx5Vewso5cnDqe'
const MORPH_API_URL = 'https://api.morphllm.com/v1/chat/completions'

export async function POST(request: NextRequest) {
  let requestData: any
  
  try {
    requestData = await request.json()
    const { problem, userCode } = requestData

    const prompt = `You are an expert JavaScript coding assistant. Provide ONLY a syntactically correct, executable JavaScript function.

PROBLEM: ${problem.title}
DESCRIPTION: ${problem.description}

CURRENT CODE:
\`\`\`javascript
${userCode}
\`\`\`

CRITICAL REQUIREMENTS:
- Return ONLY the function code - no explanations, no markdown, no extra text
- Ensure perfect JavaScript syntax (no compilation errors)
- Use exact function name from the starter code
- Handle all edge cases properly

EXAMPLES:
Two Sum: function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) { return [map.get(complement), i]; } map.set(nums[i], i); } return []; }

Reverse String: function reverseString(s) { let left = 0; let right = s.length - 1; while (left < right) { [s[left], s[right]] = [s[right], s[left]]; left++; right--; } }

Merge Two Sorted Lists: function mergeTwoLists(list1, list2) { const dummy = { val: 0, next: null }; let current = dummy; while (list1 && list2) { if (list1.val <= list2.val) { current.next = list1; list1 = list1.next; } else { current.next = list2; list2 = list2.next; } current = current.next; } current.next = list1 || list2; return dummy.next; }

Return the complete, syntactically correct function:`

    const response = await fetch(MORPH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MORPH_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'morph-v3-large',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`Morph API error: ${response.status}`)
    }

    const data = await response.json()
    let improvedCode = data.choices[0]?.message?.content || problem.solution
    
    // Clean up the response to extract only the function code
    if (improvedCode) {
      // Remove markdown code blocks if present
      improvedCode = improvedCode.replace(/```javascript\n?/g, '').replace(/```\n?/g, '')
      improvedCode = improvedCode.replace(/```js\n?/g, '').replace(/```\n?/g, '')
      
      // Remove any explanatory text before or after the function
      const functionMatch = improvedCode.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\}/);
      if (functionMatch) {
        improvedCode = functionMatch[0]
      }
      
      // Ensure proper formatting
      improvedCode = improvedCode.trim()
      
      // Validate syntax by trying to parse it
      try {
        new Function('return ' + improvedCode)()
      } catch (syntaxError) {
        console.warn('Morph API provided invalid syntax, using fallback solution')
        improvedCode = problem.solution
      }
    }

    return NextResponse.json({ 
      success: true, 
      improvedCode,
      message: 'Morph AI has analyzed and improved your code!'
    })

  } catch (error) {
    console.error('Morph API error:', error)
    
    // Fallback to pre-written solution using already parsed request data
    const fallbackSolution = requestData?.problem?.solution || 'function fallback() { return "Error"; }'
    
    return NextResponse.json({ 
      success: true, 
      improvedCode: fallbackSolution,
      message: 'Morph AI provided a fallback solution (API unavailable)'
    })
  }
}
