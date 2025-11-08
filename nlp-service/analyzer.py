"""
Main analyzer module that coordinates all detectors
"""
from typing import List, Dict, Any
from detectors import (
    ConfessionDetector,
    EyewitnessDetector,
    ForensicDetector,
    MisconductDetector,
)


class WrongfulConvictionAnalyzer:
    """
    Coordinates all detectors to analyze legal documents
    for wrongful conviction indicators
    """
    
    def __init__(self):
        self.detectors = {
            'confession': ConfessionDetector(),
            'eyewitness': EyewitnessDetector(),
            'forensic': ForensicDetector(),
            'misconduct': MisconductDetector(),
        }
    
    def analyze_document(
        self, 
        content: str, 
        document_type: str = 'transcript'
    ) -> Dict[str, Any]:
        """
        Analyze a document and return all detected indicators
        
        Args:
            content: The document text to analyze
            document_type: Type of document (transcript, evidence, appeal, etc.)
        
        Returns:
            Dictionary containing detected indicators with evidence
        """
        all_indicators = []
        
        # Run all detectors
        for detector_name, detector in self.detectors.items():
            detected = detector.detect(content, document_type)
            for indicator in detected:
                indicator['detector'] = detector_name
                all_indicators.append(indicator)
        
        return {
            'total_indicators': len(all_indicators),
            'indicators': all_indicators,
            'document_type': document_type,
            'analysis_complete': True
        }
    
    def analyze_case(
        self, 
        case_id: int,
        documents: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Analyze all documents for a case
        
        Args:
            case_id: The case identifier
            documents: List of documents, each with 'type' and 'content'
        
        Returns:
            Dictionary containing all detected indicators across all documents
        """
        case_indicators = []
        
        for doc in documents:
            result = self.analyze_document(
                doc.get('content', ''),
                doc.get('type', 'unknown')
            )
            
            for indicator in result['indicators']:
                indicator['document_type'] = doc.get('type')
                case_indicators.append(indicator)
        
        # Remove duplicates and aggregate evidence
        unique_indicators = self._aggregate_indicators(case_indicators)
        
        return {
            'case_id': case_id,
            'total_indicators': len(unique_indicators),
            'indicators': unique_indicators,
            'documents_analyzed': len(documents)
        }
    
    def _aggregate_indicators(
        self, 
        indicators: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Aggregate duplicate indicators from different documents
        """
        aggregated = {}
        
        for indicator in indicators:
            name = indicator['indicator_name']
            
            if name not in aggregated:
                aggregated[name] = {
                    'indicator_name': name,
                    'confidence': indicator['confidence'],
                    'evidence': indicator.get('evidence', []),
                    'document_types': [indicator.get('document_type', 'unknown')],
                    'detectors': [indicator.get('detector', 'unknown')]
                }
            else:
                # Average confidence scores
                current_conf = aggregated[name]['confidence']
                new_conf = indicator['confidence']
                aggregated[name]['confidence'] = (current_conf + new_conf) / 2
                
                # Add new evidence
                aggregated[name]['evidence'].extend(indicator.get('evidence', []))
                
                # Track document types
                doc_type = indicator.get('document_type', 'unknown')
                if doc_type not in aggregated[name]['document_types']:
                    aggregated[name]['document_types'].append(doc_type)
        
        return list(aggregated.values())