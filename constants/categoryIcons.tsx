import React from 'react';
import { SvgProps } from 'react-native-svg';
import BioBACLogo      from '@/assets/images/event_types/logo biobac_no_text.svg';
import BusinessBACLogo from '@/assets/images/event_types/logo businessbac_no_text.svg';
import ExpoBACLogo     from '@/assets/images/event_types/logo expobac_no_text.svg';
import ViveBACLogo     from '@/assets/images/event_types/logo vivebac_no_text.svg';
import { EventCategory } from '@/types';

export const CATEGORY_ICONS: Record<EventCategory, React.FC<SvgProps>> = {
  bioBAC:      BioBACLogo,
  businessBAC: BusinessBACLogo,
  expoBAC:     ExpoBACLogo,
  viveBAC:     ViveBACLogo,
};
