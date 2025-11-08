"""
Detector for eyewitness testimony related indicators
"""
import re
from typing import List, Dict, Any

class EyewitnessDetector:
    """Detects indicators related to eyewitness testimony issues"""
    
    def __init__(self):
        self.patterns = {
            'unreliable_witness': [
                r'(single|only|sole).*witness',
                r'(unreliable|questionable|doubtful).*witness',
                r'(poor|limited|obstructed).*view',
                r'(dark|night|dim).*lighting',
                r'(brief|quick|fleeting).*glance',
            ],
            'cross_racial': [
                r'cross-racial.*identification',
                r'different.*race',
                r'(white|black|hispanic|asian).*witness.*(white|black|hispanic|asian).*defendant',
            ],
            'suggestive_lineup': [
                r'(suggestive|biased|flawed).*lineup',
                r'(single|show[-]?up).*identification',
                r'(photo.*array|lineup).*problematic',
                r'only.*one.*match',
                r'stood.*out',
            ],
            'witness_uncertainty': [
                r'(not|un)sure',
                r'(might|maybe|possibly|perhaps)',
                r'(hesitat|uncertain)',
                r'looks.*like',
                r'could.*be',
                r'coached.*witness',
            ],
            'witness_recantation': [
                r'witness.*recant',
                r'take.*back.*testimony',
                r'was.*wrong.*identification',
                r'mistaken.*identity',
            ],
            'inconsistent_statements': [
                r'(inconsistent|contradict|conflict).*statement',
                r'(changed|modified|altered).*testimony',
                r'(different|varying).*account',
            ],
        }
    
    def detect(self, text: str, document_type: str) -> List[Dict[str, Any]]:
        """Detect eyewitness-related indicators"""
        results = []
        text_lower = text.lower()
        
        if self._check_patterns(text_lower, self.patterns['unreliable_witness']):
            results.append({
                'indicator_name': 'Single Unreliable Eyewitness',
                'confidence': 0.70,
                'evidence': self._extract_context(text, self.patterns['unreliable_witness'])
            })
        
        if self._check_patterns(text_lower, self.patterns['cross_racial']):
            results.append({
                'indicator_name': 'Cross-Racial Identification',
                'confidence': 0.75,
                'evidence': self._extract_context(text, self.patterns['cross_racial'])
            })
        
        if self._check_patterns(text_lower, self.patterns['suggestive_lineup']):
            results.append({
                'indicator_name': 'Suggestive Lineup Procedures',
                'confidence': 0.80,
                'evidence': self._extract_context(text, self.patterns['suggestive_lineup'])
            })
        
        if self._check_patterns(text_lower, self.patterns['witness_uncertainty']):
            results.append({
                'indicator_name': 'Witness Uncertainty',
                'confidence': 0.65,
                'evidence': self._extract_context(text, self.patterns['witness_uncertainty'])
            })
        
        if self._check_patterns(text_lower, self.patterns['witness_recantation']):
            results.append({
                'indicator_name': 'Witness Recantation',
                'confidence': 0.90,
                'evidence': self._extract_context(text, self.patterns['witness_recantation'])
            })
        
        if self._check_patterns(text_lower, self.patterns['inconsistent_statements']):
            results.append({
                'indicator_name': 'Inconsistent Witness Statements',
                'confidence': 0.70,
                'evidence': self._extract_context(text, self.patterns['inconsistent_statements'])
            })
        
        return results
    
    def _check_patterns(self, text: str, patterns: List[str]) -> bool:
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def _extract_context(self, text: str, patterns: List[str], context_size: int = 100) -> List[str]:
        contexts = []
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                start = max(0, match.start() - context_size)
                end = min(len(text), match.end() + context_size)
                contexts.append(text[start:end].strip())
        return contexts[:3]