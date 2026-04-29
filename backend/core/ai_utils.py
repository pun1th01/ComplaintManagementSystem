import json
import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client with a safe fallback
try:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY", "dummy_key"))
except Exception:
    client = None


def categorize_complaint(text):
    """
    Analyzes a complaint string using Groq's Llama 3 model and returns
    a categorization with priority score.
    """
    system_prompt = """You are a Hostel Triage Manager. 
    Analyze the given complaint and return a strictly parsable JSON string EXACTLY like this:
    {"category": "Plumbing", "priority_score": 8}
    
    The category MUST be one of the following:
    - Plumbing
    - Electrical
    - Cleanliness
    - Food
    - IT
    - General
    
    Assign a priority score from 1-10 (10 being highest danger/urgency).
    Respond ONLY with the JSON object. Do not include any markdown formatting, backticks, or extra text."""
    
    user_message = f"Complaint to categorize: {text}"
    
    try:
        message = client.messages.create(
            model="llama-3.1-70b-versatile",
            max_tokens=100,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_message}
            ],
            temperature=0.0
        )
        
        response_text = message.content[0].text.strip()
        # Remove markdown code blocks if the AI accidentally includes them
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
            
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
            'priority_score': 5
        }
    except Exception as e:
        # Handle other errors gracefully
        return {
            'category': 'General',
            'priority_score': 5
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
