"""
Detector for prosecutorial and official misconduct indicators
"""
import re
from typing import List, Dict, Any

class MisconductDetector:
    """Detects indicators related to official misconduct"""
    
    def __init__(self):
        self.patterns = {
            'brady_violation': [
                r'brady.*violation',
                r'withheld.*evidence',
                r'suppressed.*evidence',
                r'(concealed|hid).*exculpatory',
                r'failed.*disclose',
            ],
            'fabricated_statements': [
                r'(fabricat|manufactur|creat).*evidence',
                r'(false|fake).*statement',
                r'(plant|tam per).*evidence',
                r'coerced.*testimony',
            ],
            'official_misconduct': [
                r'(prosecutorial|police).*misconduct',
                r'(abuse|misuse).*power',
                r'(corrupt|improper).*conduct',
                r'(bias|preju dice).*investigation',
            ],
            'inflammatory_arguments': [
                r'inflammatory.*argument',
                r'prejudicial.*statement',
                r'improper.*closing',
                r'appeal.*emotion',
            ],
        }
    
    def detect(self, text: str, document_type: str) -> List[Dict[str, Any]]:
        """Detect misconduct indicators"""
        results = []
        text_lower = text.lower()
        
        if self._check_patterns(text_lower, self.patterns['brady_violation']):
            results.append({
                'indicator_name': 'Brady Violations',
                'confidence': 0.90,
                'evidence': self._extract_context(text, self.patterns['brady_violation'])
            })
        
        if self._check_patterns(text_lower, self.patterns['fabricated_statements']):
            results.append({
                'indicator_name': 'Fabricated Witness Statements',
                'confidence': 0.85,
                'evidence': self._extract_context(text, self.patterns['fabricated_statements'])
            })
        
        if self._check_patterns(text_lower, self.patterns['official_misconduct']):
            results.append({
                'indicator_name': 'Official Misconduct',
                'confidence': 0.80,
                'evidence': self._extract_context(text, self.patterns['official_misconduct'])
            })
        
        if self._check_patterns(text_lower, self.patterns['inflammatory_arguments']):
            results.append({
                'indicator_name': 'Inflammatory Arguments',
                'confidence': 0.70,
                'evidence': self._extract_context(text, self.patterns['inflammatory_arguments'])
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