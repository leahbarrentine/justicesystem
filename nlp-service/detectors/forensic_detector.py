"""
Detector for forensic evidence related indicators
"""
import re
from typing import List, Dict, Any

class ForensicDetector:
    """Detects indicators related to forensic evidence issues"""
    
    def __init__(self):
        self.patterns = {
            'no_physical_evidence': [
                r'no.*(physical|forensic).*evidence',
                r'lack.*evidence',
                r'absence.*evidence',
                r'without.*evidence',
            ],
            'disproven_forensic': [
                r'(disproven|discredited|invalidated).*evidence',
                r'(false|erroneous).*forensic',
                r'(retracted|withdrawn).*expert',
            ],
            'discredited_methods': [
                r'(hair|bite.*mark|fiber).*analysis',
                r'discredited.*method',
                r'(unreliable|unvalidated).*technique',
                r'junk.*science',
                r'arson.*investigation.*flawed',
            ],
            'dna_not_tested': [
                r'DNA.*(not|never).*test',
                r'DNA.*excluded',
                r'DNA.*evidence.*unavailable',
                r'DNA.*not.*admitted',
                r'refuse.*DNA.*test',
            ],
        }
    
    def detect(self, text: str, document_type: str) -> List[Dict[str, Any]]:
        """Detect forensic evidence indicators"""
        results = []
        text_lower = text.lower()
        
        if self._check_patterns(text_lower, self.patterns['no_physical_evidence']):
            results.append({
                'indicator_name': 'No Physical Evidence',
                'confidence': 0.75,
                'evidence': self._extract_context(text, self.patterns['no_physical_evidence'])
            })
        
        if self._check_patterns(text_lower, self.patterns['disproven_forensic']):
            results.append({
                'indicator_name': 'Forensic Evidence Disproven',
                'confidence': 0.85,
                'evidence': self._extract_context(text, self.patterns['disproven_forensic'])
            })
        
        if self._check_patterns(text_lower, self.patterns['discredited_methods']):
            results.append({
                'indicator_name': 'Discredited Forensic Methods',
                'confidence': 0.80,
                'evidence': self._extract_context(text, self.patterns['discredited_methods'])
            })
        
        if self._check_patterns(text_lower, self.patterns['dna_not_tested']):
            results.append({
                'indicator_name': 'DNA Not Tested',
                'confidence': 0.85,
                'evidence': self._extract_context(text, self.patterns['dna_not_tested'])
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