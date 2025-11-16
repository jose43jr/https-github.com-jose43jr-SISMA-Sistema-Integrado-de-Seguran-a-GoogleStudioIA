
export enum AppTab {
  ASSISTANT = 'assistant',
  IMAGE_ANALYSIS = 'image_analysis',
  CHECKLIST = 'checklist',
}

export interface Detection {
  class: string;
  bbox: [number, number, number, number];
  score: number;
}

export interface ImageAnalysisResult {
  detections: Detection[];
  flagged: boolean;
  suggested_action: string;
}

export interface ChecklistAnswer {
  question_id: string;
  value: 2 | 1 | 0;
  comment?: string | null;
  photo?: string | null;
}

export interface NonConformity {
    question_id: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    suggested_action: string;
}

export interface Report {
    report_id: string;
    equipment_id: string | null;
    inspector_id: string;
    timestamp: string;
    answers: ChecklistAnswer[];
    summary: string;
    non_conformities: NonConformity[];
    attachments: string[];
    pdf_url: string;
}
