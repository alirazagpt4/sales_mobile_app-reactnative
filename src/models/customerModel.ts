// CustomerModel.ts

// Ye Customer object ka structure hai jo hum save karain ge.
export interface Customer {
    id: string; // Unique ID (hum yahan timestamp use karain ge)
    customerName: string;
    contact: string;
    area: string;
    tehsil: string;
    type: 'farmer' | 'dealer'; // farmer/dealer dropdown
    visitStatus: 'visit' | 'mature'; // Visit/mature dropdown
    createdAt: number; // Kab add hua
}