import json
from groq import Groq

# Initialize Groq client
client = Groq()


def categorize_complaint(text):
    """
    Analyzes a complaint string using Groq's Llama 3 model and returns
    a categorization with priority score.
    
    Args:
        text (str): The complaint text to analyze.
    
    Returns:
        dict: A dictionary containing:
            - 'category' (str): One of ['Plumbing', 'Electrical', 'IT', 'General']
            - 'priority_score' (int): A score from 1-10 indicating urgency
    
    Example:
        >>> result = categorize_complaint("The bathroom sink is leaking")
        >>> result
        {'category': 'Plumbing', 'priority_score': 7}
    """
    system_prompt = """You are a hostel complaint categorization assistant. 
    Analyze the given complaint and categorize it into one of these categories:
    - Plumbing: Issues related to bathrooms, sinks, toilets, water leaks, etc.
    - Electrical: Issues related to lights, power, circuits, appliances, etc.
    - IT: Issues related to WiFi, internet, computers, software, etc.
    - General: Any other issues not fitting above categories.
    
    Also assign a priority score from 1-10 where:
    - 1-3: Low priority (cosmetic issues)
    - 4-6: Medium priority (affects comfort)
    - 7-10: High priority (safety or critical functionality)
    
    Respond ONLY with a valid JSON object in this exact format:
    {"category": "string", "priority_score": number}"""
    
    user_message = f"Complaint to categorize: {text}"
    
    try:
        message = client.messages.create(
            model="llama-3.1-70b-versatile",
            max_tokens=100,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        
        response_text = message.content[0].text.strip()
        result = json.loads(response_text)
        
        # Validate the response
        if 'category' not in result or 'priority_score' not in result:
            raise ValueError("Invalid response format from AI model")
        
        # Ensure category is valid
        valid_categories = ['Plumbing', 'Electrical', 'IT', 'General']
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
