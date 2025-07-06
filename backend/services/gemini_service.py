import google.generativeai as genai
import json
import os
from typing import Dict, Any


class GeminiService:
    def __init__(self):
        self.api_key = None
        self.model = None

    def initialize_gemini(self, api_key: str) -> bool:
        """Initialize Gemini with API key"""
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.api_key = api_key
            return True
        except Exception as e:
            print(f"Error initializing Gemini: {e}")
            return False

    def analyze_lunar_results(self, analysis_report: str, detailed_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze lunar processing results using Gemini"""
        try:
            if not self.model:
                return {"error": "Gemini not initialized"}

            prompt = f"""
            As a lunar geology expert, analyze this lunar surface analysis data and provide a comprehensive scientific summary:

            ANALYSIS REPORT:
            {analysis_report}

            DETAILED ANALYSIS DATA:
            {json.dumps(detailed_analysis, indent=2)}

            Please provide a detailed analysis in JSON format with the following structure:
            {{
                "scientific_summary": "Overall scientific interpretation of the lunar surface",
                "topographic_features": "Description of elevation patterns and terrain features",
                "crater_analysis": "Analysis of detected craters and their characteristics",
                "geological_significance": "Geological interpretation and formation processes",
                "mission_relevance": "Relevance for lunar missions and landing site assessment",
                "key_metrics": "Summary of important quantitative measurements",
                "recommendations": "Recommendations for further analysis or mission planning"
            }}

            Focus on scientific accuracy and provide insights that would be valuable for lunar researchers and mission planners.
            """

            response = self.model.generate_content(prompt)

            # Parse the response as JSON
            try:
                analysis_result = json.loads(response.text)
                return analysis_result
            except json.JSONDecodeError:
                # If not valid JSON, return as text
                return {
                    "scientific_summary": response.text,
                    "status": "text_response"
                }

        except Exception as e:
            return {"error": f"Gemini analysis failed: {str(e)}"}
