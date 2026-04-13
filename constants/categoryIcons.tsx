import React from 'react';
import { SvgProps } from 'react-native-svg';
import BioBACLogo      from '@/assets/images/event_types/logo biobac.svg';
import BusinessBACLogo from '@/assets/images/event_types/logo businessbac.svg';
import ExpoBACLogo     from '@/assets/images/event_types/logo expobac.svg';
import ViveBACLogo     from '@/assets/images/event_types/logo vivebac.svg';
import { EventCategory } from '@/types';

export const CATEGORY_ICONS: Record<EventCategory, React.FC<SvgProps>> = {
  bioBAC:      BioBACLogo,
  businessBAC: BusinessBACLogo,
  expoBAC:     ExpoBACLogo,
  viveBAC:     ViveBACLogo,
};
