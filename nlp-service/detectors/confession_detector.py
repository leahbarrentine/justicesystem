"""
Detector for confession-related indicators of wrongful conviction
"""
import re
from typing import List, Dict, Any

class ConfessionDetector:
    """Detects indicators related to confessions and interrogations"""
    
    def __init__(self):
        self.patterns = {
            'coerced_confession': [
                r'(coer(ced|cion)|force[d]?|pressure|threat|intimidat)',
                r'(fear|afraid|scared).*confess',
                r'didn\'t.*want.*confess',
                r'(told|said).*confess.*or else',
            ],
            'recanted': [
                r'recant(ed|ation)',
                r'take.*back.*confession',
                r'(false|untrue).*confession',
                r'not.*true.*when.*confess',
            ],
            'missing_details': [
                r'lack.*detail',
                r'vague.*confession',
                r'general.*statement',
                r'no.*specific.*information',
                r'couldn\'t.*describe',
            ],
            'long_interrogation': [
                r'(\d+)\s*hour',
                r'(lengthy|extended|prolonged).*interrogation',
                r'all\s*(night|day)',
                r'without.*break',
                r'exhausted|tired|fatigue',
            ],
        }
    
    def detect(self, text: str, document_type: str) -> List[Dict[str, Any]]:
        """
        Detect confession-related indicators in text
        
        Returns list of detected indicators with citations
        """
        results = []
        text_lower = text.lower()
        
        # Check for coerced confession
        if self._check_patterns(text_lower, self.patterns['coerced_confession']):
            results.append({
                'indicator_name': 'Coerced or False Confession',
                'confidence': 0.75,
                'evidence': self._extract_context(text, self.patterns['coerced_confession'])
            })
        
        # Check for recantation
        if self._check_patterns(text_lower, self.patterns['recanted']):
            results.append({
                'indicator_name': 'Confession Recanted',
                'confidence': 0.85,
                'evidence': self._extract_context(text, self.patterns['recanted'])
            })
        
        # Check for missing details
        if self._check_patterns(text_lower, self.patterns['missing_details']):
            results.append({
                'indicator_name': 'Confession Missing Details',
                'confidence': 0.70,
                'evidence': self._extract_context(text, self.patterns['missing_details'])
            })
        
        # Check for long interrogation
        if self._check_patterns(text_lower, self.patterns['long_interrogation']):
            # Try to extract duration
            duration_match = re.search(r'(\d+)\s*hour', text_lower)
            confidence = 0.80
            if duration_match and int(duration_match.group(1)) >= 8:
                confidence = 0.90
            
            results.append({
                'indicator_name': 'Long High-Pressure Interrogation',
                'confidence': confidence,
                'evidence': self._extract_context(text, self.patterns['long_interrogation'])
            })
        
        return results
    
    def _check_patterns(self, text: str, patterns: List[str]) -> bool:
        """Check if any pattern matches the text"""
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def _extract_context(self, text: str, patterns: List[str], context_size: int = 100) -> List[str]:
        """Extract context around pattern matches"""
        contexts = []
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                start = max(0, match.start() - context_size)
                end = min(len(text), match.end() + context_size)
                contexts.append(text[start:end].strip())
        return contexts[:3]  # Return up to 3 examples