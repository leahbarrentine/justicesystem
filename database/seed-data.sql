-- Seed data for Wrongful Conviction Detection System

-- Insert indicator categories
INSERT INTO indicator_categories (name, description, weight) VALUES
('Confession-Related', 'Indicators related to confessions and interrogations', 1.5),
('Eyewitness Testimony', 'Issues with eyewitness identification and testimony', 1.4),
('Informant Testimony', 'Problems with jailhouse informants and incentivized witnesses', 1.3),
('Forensic Evidence', 'Forensic science issues and evidence problems', 1.6),
('Prosecutorial Misconduct', 'Misconduct by prosecutors and investigators', 1.8),
('Defense Inadequacy', 'Issues with defense representation', 1.5),
('Evidence Quality', 'Problems with the strength and reliability of evidence', 1.4),
('Post-Conviction', 'New evidence or developments after conviction', 1.7),
('Systemic Factors', 'Contextual and systemic risk factors', 1.2);

-- Insert the 30 indicators
INSERT INTO indicators (category_id, name, description, severity, weight) VALUES
-- Confession-Related (Category 1)
(1, 'Coerced or False Confession', 'Evidence of coercion or false confession during interrogation', 'critical', 1.8),
(1, 'Confession Recanted', 'Defendant later recanted their confession', 'high', 1.6),
(1, 'Confession Missing Details', 'Confession lacks crime-specific details only perpetrator would know', 'high', 1.5),
(1, 'Long High-Pressure Interrogation', 'Documented lengthy or high-pressure interrogation tactics', 'medium', 1.3),

-- Eyewitness Testimony (Category 2)
(2, 'Single Unreliable Eyewitness', 'Case relies on single or unreliable eyewitness', 'high', 1.5),
(2, 'Cross-Racial Identification', 'Cross-racial eyewitness identification', 'medium', 1.2),
(2, 'Suggestive Lineup Procedures', 'Lineup procedures were suggestive or flawed', 'high', 1.6),
(2, 'Witness Uncertainty', 'Witness expressed uncertainty or appeared coached', 'medium', 1.3),
(2, 'Witness Recantation', 'Eyewitness recanted testimony after conviction', 'critical', 1.9),
(2, 'Inconsistent Witness Statements', 'Witness statements inconsistent across testimonies', 'medium', 1.4),

-- Informant Testimony (Category 3)
(3, 'Jailhouse Informant', 'Case relies on jailhouse informant testimony', 'high', 1.6),
(3, 'Incentivized Witness', 'Witness testimony was incentivized (reduced sentence, payment)', 'high', 1.5),

-- Forensic Evidence (Category 4)
(4, 'No Physical Evidence', 'No physical or forensic evidence linking defendant', 'high', 1.5),
(4, 'Forensic Evidence Disproven', 'Forensic evidence later disproven or deemed unreliable', 'critical', 1.9),
(4, 'Discredited Forensic Methods', 'Use of discredited forensic methods (hair, bite mark analysis)', 'high', 1.7),
(4, 'DNA Not Tested', 'DNA evidence excluded from trial or never tested', 'high', 1.6),

-- Prosecutorial Misconduct (Category 5)
(5, 'Brady Violations', 'Prosecutors withheld exculpatory evidence', 'critical', 2.0),
(5, 'Fabricated Witness Statements', 'Evidence of fabricated or coerced witness statements', 'critical', 1.9),
(5, 'Official Misconduct', 'Official misconduct during investigation or trial', 'critical', 1.8),
(5, 'Inflammatory Arguments', 'Prosecutor made inflammatory or prejudicial arguments', 'medium', 1.2),

-- Defense Inadequacy (Category 6)
(6, 'Failed to Investigate', 'Defense failed to investigate or call key witnesses', 'high', 1.6),
(6, 'Ineffective Counsel', 'Ineffective or overburdened public defender', 'high', 1.5),
(6, 'No Expert Testimony', 'No defense expert testimony or forensic challenge', 'medium', 1.3),
(6, 'Missed Deadlines', 'Defense missed appeal deadlines or made procedural errors', 'medium', 1.4),

-- Evidence Quality (Category 7)
(7, 'Weak Prosecution Evidence', 'Contradictory or weak prosecution evidence', 'high', 1.5),
(7, 'Alternate Suspect Ignored', 'Alternate suspect ignored or dismissed', 'high', 1.6),
(7, 'Evidence Tampering', 'Missing, destroyed, or tampered evidence', 'critical', 1.9),

-- Post-Conviction (Category 8)
(8, 'New Exculpatory Evidence', 'Newly discovered exculpatory evidence (DNA, witnesses, documents)', 'critical', 2.0),
(8, 'Multiple Appeals', 'Multiple appeals citing new facts or evidence', 'high', 1.5),
(8, 'Dissenting Opinions', 'Dissenting opinions in appellate decision', 'medium', 1.3),

-- Systemic Factors (Category 9)
(9, 'Problematic Jurisdiction', 'Jurisdiction with known history of wrongful convictions', 'medium', 1.2),
(9, 'Racial Bias', 'Evidence of racial bias in investigation, jury, or sentencing', 'high', 1.6),
(9, 'Moral Panic Context', 'Conviction during moral panic or intense media pressure', 'medium', 1.3),
(9, 'Disproportionate Demographics', 'Defendant from demographic with higher wrongful conviction rates', 'low', 1.1),
(9, 'Harsh Sentence', 'Unusually harsh sentence relative to the charge', 'medium', 1.2),
(9, 'Implausible Narrative', 'Lack of motive or implausible narrative of guilt', 'medium', 1.3),
(9, 'Maintained Innocence', 'Defendant maintains innocence consistently over time', 'low', 1.1);