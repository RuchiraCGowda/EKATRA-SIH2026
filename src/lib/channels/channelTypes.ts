import { AppLanguage, Lot, PriceRecord, MaterialCategory } from '../../types/database';
import { MaterialMetallurgy } from '../metallurgicalComposition';

export type ChannelType = 'app' | 'whatsapp' | 'sms';

export interface ChannelMessage {
  id: string;
  sender: 'user' | 'system' | 'bot';
  text: string;
  timestamp: string;
  channel: ChannelType;
  imageUrl?: string;
  imageCaption?: string;
  metadata?: {
    lotCode?: string;
    action?: string;
    categoryCode?: string;
    options?: string[];
    metallurgy?: MaterialMetallurgy;
    aiIdentifiedCategory?: string;
    benchmarkRate?: number;
  };
}

export interface ChannelSession {
  channel: ChannelType;
  userPhone: string;
  lang: AppLanguage;
  currentStep?: 'idle' | 'awaiting_category' | 'awaiting_weight' | 'awaiting_location' | 'awaiting_confirmation';
  draftLot?: {
    categoryId?: string;
    categoryCode?: string;
    weightKg?: number;
    locationName?: string;
    imageUrl?: string;
  };
}

export interface ChannelResponse {
  channel: ChannelType;
  text: string;
  options?: string[];
  createdLot?: Lot;
  referencedLots?: Lot[];
  referencedPrice?: PriceRecord;
  imageUrl?: string;
  metallurgy?: MaterialMetallurgy;
}
