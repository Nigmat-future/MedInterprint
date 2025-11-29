export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export enum ConsultationType {
  IMAGING = 'imaging',       // CT, MRI, Ultrasound
  LAB_TEST = 'lab_test',     // Blood, Urine, Pathology
  DECISION = 'decision',     // Medical Decision Support
  MEDICATION = 'medication'  // Drug interactions, usage
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64 string
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachment?: Attachment;
  timestamp: number;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}