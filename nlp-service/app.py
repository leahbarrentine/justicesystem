"""
NLP Service API for Wrongful Conviction Detection
"""
from flask import Flask, request, jsonify
from analyzer import WrongfulConvictionAnalyzer
import os

app = Flask(__name__)
analyzer = WrongfulConvictionAnalyzer()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'nlp-analyzer'})

@app.route('/analyze/document', methods=['POST'])
def analyze_document():
    """
    Analyze a single document for wrongful conviction indicators
    
    Expects JSON:
    {
        "content": "document text",
        "document_type": "transcript|evidence|appeal"
    }
    """
    data = request.get_json()
    
    if not data or 'content' not in data:
        return jsonify({'error': 'Missing content field'}), 400
    
    content = data['content']
    document_type = data.get('document_type', 'transcript')
    
    result = analyzer.analyze_document(content, document_type)
    
    return jsonify(result)

@app.route('/analyze/case', methods=['POST'])
def analyze_case():
    """
    Analyze all documents for a case
    
    Expects JSON:
    {
        "case_id": 123,
        "documents": [
            {"type": "transcript", "content": "..."},
            {"type": "evidence", "content": "..."}
        ]
    }
    """
    data = request.get_json()
    
    if not data or 'case_id' not in data or 'documents' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    case_id = data['case_id']
    documents = data['documents']
    
    result = analyzer.analyze_case(case_id, documents)
    
    return jsonify(result)

@app.route('/indicators', methods=['GET'])
def get_indicators():
    """Get list of all detectable indicators"""
    indicators = [
        # Confession-related
        'Coerced or False Confession',
        'Confession Recanted',
        'Confession Missing Details',
        'Long High-Pressure Interrogation',
        # Eyewitness-related
        'Single Unreliable Eyewitness',
        'Cross-Racial Identification',
        'Suggestive Lineup Procedures',
        'Witness Uncertainty',
        'Witness Recantation',
        'Inconsistent Witness Statements',
        # Forensic-related
        'No Physical Evidence',
        'Forensic Evidence Disproven',
        'Discredited Forensic Methods',
        'DNA Not Tested',
        # Misconduct-related
        'Brady Violations',
        'Fabricated Witness Statements',
        'Official Misconduct',
        'Inflammatory Arguments',
    ]
    
    return jsonify({'indicators': indicators, 'count': len(indicators)})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)