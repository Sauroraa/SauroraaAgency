import { Artist } from './artist';

export interface Booking {
  id: string;
  referenceCode: string;
  artistId: string;
  status: string;
  score: number | null;
  scoreBreakdown: any;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  requesterCompany: string | null;
  eventName: string;
  eventDate: string;
  eventDateFlexible: boolean;
  eventVenue: string | null;
  eventCity: string;
  eventCountry: string;
  eventType: string;
  expectedAttendance: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetCurrency: string;
  message: string | null;
  technicalRequirements: string | null;
  accommodationNeeded: boolean;
  travelNeeded: boolean;
  quotedAmount: number | null;
  quotePdfUrl: string | null;
  quoteSentAt: string | null;
  digitalSignature: string | null;
  signedAt: string | null;
  assignedTo: string | null;
  artist?: Artist;
  comments?: BookingComment[];
  statusHistory?: BookingStatusHistory[];
  createdAt: string;
}

export interface BookingComment {
  id: string;
  bookingId: string;
  userId: string;
  content: string;
  isInternal: boolean;
  user?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface BookingStatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  note: string | null;
  changedByUser?: { firstName: string; lastName: string };
  createdAt: string;
}
