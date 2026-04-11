import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NotificationLeadTime, NotificationSettings } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  notificationSettings: NotificationSettings;
  onUpdateNotifications: (patch: Partial<NotificationSettings>) => void;
}

const LEAD_TIME_OPTIONS: NotificationLeadTime[] = [5, 10, 15, 30];

export function GlobalMenu({ visible, onClose, notificationSettings, onUpdateNotifications }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const slideAnim = useRef(new Animated.Value(320)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: Platform.OS !== 'web',
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 320,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: colors.card, transform: [{ translateX: slideAnim }] },
        ]}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.drawerTitle, { color: colors.text }]}>Settings</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialIcons name="close" size={24} color={colors.icon} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Notifications section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Notifications</Text>

              <View style={[styles.row, { borderBottomColor: colors.border }]}>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Event reminders</Text>
                  <Text style={[styles.rowSub, { color: colors.icon }]}>
                    Receive reminders before events you have added to your personal schedule.
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.enabled}
                  onValueChange={(v) => onUpdateNotifications({ enabled: v })}
                  trackColor={{ true: BACColors.teal, false: colors.border }}
                  thumbColor="#fff"
                />
              </View>

              {notificationSettings.enabled && (
                <View style={[styles.leadTimeSection, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Reminder time</Text>
                  <View style={styles.leadTimeOptions}>
                    {LEAD_TIME_OPTIONS.map((min) => (
                      <Pressable
                        key={min}
                        style={[
                          styles.leadTimeBtn,
                          {
                            backgroundColor:
                              notificationSettings.leadTime === min
                                ? BACColors.teal
                                : BACColors.greyLight,
                          },
                        ]}
                        onPress={() => onUpdateNotifications({ leadTime: min })}>
                        <Text
                          style={[
                            styles.leadTimeBtnText,
                            {
                              color: notificationSettings.leadTime === min ? '#fff' : BACColors.navyDark,
                            },
                          ]}>
                          {min} min
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Privacy Notice */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Privacy Notice</Text>
              <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  This app does not collect any personal data from its users. All saved
                  information (personal schedule) is stored exclusively on your device and is
                  never transmitted to any server.
                </Text>
              </View>
            </View>

            {/* Help & Support */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Help & Support</Text>
              <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  For any technical issues with the app, contact the ASBTEC IT Officer.
                </Text>
                <Text style={[styles.emailLink, { color: BACColors.teal }]}>
                  informatica@asbtec.cat
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    elevation: 8,
    ...Platform.select({
      native: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: -4, height: 0 } },
      web: { boxShadow: '-4px 0px 10px rgba(0,0,0,0.2)' },
    }),
  },
  safeArea: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  leadTimeSection: {
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  leadTimeOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  leadTimeBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  leadTimeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emailLink: {
    fontSize: 13,
    fontWeight: '600',
  },
});
