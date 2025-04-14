export interface Unhabit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  goal?: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  notificationTime?: string;
  notificationEnabled: boolean;
}

export interface UnhabitLog {
  id: string;
  userId: string;
  unhabitId: string;
  date: Date;
  count: number;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  enabled: boolean;
  time?: string;
}
