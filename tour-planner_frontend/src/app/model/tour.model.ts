/**
 * Tour Model - Represents a tour with all required attributes
 */
export interface Tour {
  id: number;
  name: string;
  description?: string;
  fromLocation: string;
  toLocation: string;
  transportType: 'bike' | 'hike' | 'run' | 'vacation';
  distance: number;
  estimatedTime: number;
  popularity: number;
  childFriendliness: number;
  averageRating: number;
  image?: string;
  routeGeometry?: string;
  tourLogs?: TourLog[];
  createdAt?: Date;
  modifiedAt?: Date;
}

/**
 * TourLog Model - Represents a log entry for a specific tour
 */
export interface TourLog {
  id: number;
  tourId: number;
  dateTime: Date;
  comment?: string;
  difficulty: number;
  distance: number;
  totalTime: number;
  rating: number;
  createdAt?: Date;
  modifiedAt?: Date;
}
