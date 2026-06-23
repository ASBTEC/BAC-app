import React from 'react';
import { Image } from 'react-native';
import { SvgProps } from 'react-native-svg';
import BioBACLogo      from '@/assets/images/event_types/logo biobac_no_text.svg';
import BusinessBACLogo from '@/assets/images/event_types/logo businessbac_no_text.svg';
import ExpoBACLogo     from '@/assets/images/event_types/logo expobac_no_text.svg';
import ViveBACLogo     from '@/assets/images/event_types/logo vivebac_no_text.svg';
import { EventCategory } from '@/types';

const GeneralIcon: React.FC<SvgProps> = ({ width = 22, height = 22, color }) => (
  <Image
    source={require('@/assets/images/android-icon-monochrome.png')}
    style={{ width: Number(width), height: Number(height), tintColor: color as string }}
    resizeMode="contain"
  />
);

export const CATEGORY_ICONS: Partial<Record<EventCategory, React.FC<SvgProps>>> = {
  bioBAC:      BioBACLogo,
  businessBAC: BusinessBACLogo,
  expoBAC:     ExpoBACLogo,
  viveBAC:     ViveBACLogo,
  general:     GeneralIcon,
};
