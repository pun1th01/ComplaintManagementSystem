import base64
import json
import os
import re
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client with a safe fallback
try:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY", "dummy_key"))
except Exception:
    client = None


def categorize_complaint(text, image_bytes=None, mime_type="image/jpeg"):
    """
    Analyzes a complaint string using Groq's Llama model and returns
    a categorization with priority score. If an image is provided, 
    uses a multi-modal vision model.
    """
    system_prompt = """You are a Hostel Triage Manager. 
    Analyze the given complaint (and image if provided) and return a strictly parsable JSON string EXACTLY like this:
    {"category": "Plumbing", "priority_score": 8, "summary": "1-sentence description of the visual evidence or issue"}
    
    The category MUST be one of the following:
    - Plumbing
    - Electrical
    - Cleanliness
    - Food
    - IT
    - General
    
    Assign a priority score from 1-10 (10 being highest danger/urgency).
    Respond ONLY with the JSON object. Do not include any markdown formatting, backticks, or extra text."""
    
    if image_bytes:
        model_name = "llama-3.2-11b-vision-preview"
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        user_message_content = [
            {"type": "text", "text": f"Complaint to categorize: {text}"},
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:{mime_type};base64,{base64_image}",
                },
            },
        ]
    else:
        model_name = "llama-3.3-70b-versatile"
        user_message_content = f"Complaint to categorize: {text}"
    
    try:
        if image_bytes:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message_content}
            ]
        else:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message_content}
            ]

        message = client.chat.completions.create(
            model=model_name,
            max_tokens=100,
            messages=messages,
            temperature=0.0
        )
        
        response_text = message.choices[0].message.content.strip()
        
        # Robust fallback extraction for strict JSON enforcing
        # If the LLM wraps the response in markdown, or adds chatter, find the first '{' and last '}'
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            response_text = match.group(0)
            
        result = json.loads(response_text)
        
        # Validate the response
        if 'category' not in result or 'priority_score' not in result:
            raise ValueError("Invalid response format from AI model")
        
        # Ensure category is valid
        valid_categories = ['Plumbing', 'Electrical', 'Cleanliness', 'Food', 'IT', 'General']
        if result['category'] not in valid_categories:
            result['category'] = 'General'
        
        # Ensure priority_score is in valid range
        result['priority_score'] = max(1, min(10, int(result['priority_score'])))
        
        return result
    
    except json.JSONDecodeError:
        # Fallback if response is not valid JSON
        return {
            'category': 'General',
            'priority_score': 5,
            'summary': 'Could not parse summary.'
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Handle other errors gracefully
        return {
            'category': 'General',
            'priority_score': 5,
            'summary': 'Error parsing details.'
        }


def match_roommates(target_student_dict, available_students_list):
    """
    Calculates compatibility between a target student and available students
    based on matching criteria and returns sorted matches.
    
    Compatibility scoring:
    - Sleep schedule match: +5 points
    - Dietary preference match: +4 points
    - Year match (cohort): +3 points
    - Balcony preference match: +2 points
    - Course match: +1 point
    
    Args:
        target_student_dict (dict): Target student data with keys:
            - 'sleep_schedule' (str): Sleep preference (e.g., "early", "late")
            - 'dietary_preference' (str): Diet (e.g., "veg", "non-veg")
            - 'year' (int): Academic year (e.g., 1, 2, 3, 4)
            - 'balcony_preference' (bool): Wants a balcony or not
            - 'course' (str): Course name (e.g., "Computer Science")
        
        available_students_list (list): List of student dicts with same structure
            as target_student_dict.
    
    Returns:
        list: List of dicts with student data and compatibility score,
              sorted in descending order by compatibility_score. Each dict includes:
              - All original student fields
              - 'compatibility_score' (int): Total compatibility score
    
    Example:
        >>> target = {'sleep_schedule': 'early', 'dietary_preference': 'veg', 'year': 2, 'balcony_preference': True, 'course': 'CS'}
        >>> available = [
        ...     {'name': 'Alice', 'sleep_schedule': 'early', 'dietary_preference': 'veg', 'year': 2, 'balcony_preference': True, 'course': 'CS'},
        ...     {'name': 'Bob', 'sleep_schedule': 'late', 'dietary_preference': 'non-veg', 'year': 1, 'balcony_preference': False, 'course': 'Math'}
        ... ]
        >>> matches = match_roommates(target, available)
        >>> matches[0]['compatibility_score']
        15
    """
    matches = []
    
    for student in available_students_list:
        compatibility_score = 0
        
        # Check sleep schedule match (+5)
        if (target_student_dict.get('sleep_schedule', '').lower() ==
            student.get('sleep_schedule', '').lower()):
            compatibility_score += 5
            
        # Check dietary preference match (+4)
        if (target_student_dict.get('dietary_preference', '').lower() ==
            student.get('dietary_preference', '').lower()):
            compatibility_score += 4
        
        # Check year match (+3)
        if target_student_dict.get('year') == student.get('year'):
            compatibility_score += 3
            
        # Check balcony preference match (+2)
        if target_student_dict.get('balcony_preference') == student.get('balcony_preference'):
            compatibility_score += 2
        
        # Check course match (+1)
        if (target_student_dict.get('course', '').lower() ==
            student.get('course', '').lower()):
            compatibility_score += 1
        
        # Create a result entry with the student data and compatibility score
        result_entry = student.copy()
        result_entry['compatibility_score'] = compatibility_score
        matches.append(result_entry)
    
    # Sort matches by compatibility score in descending order
    matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
    
    return matches
