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
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
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
            <Text style={[styles.drawerTitle, { color: colors.text }]}>Ajustes</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialIcons name="close" size={24} color={colors.icon} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Notifications section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Notificaciones</Text>

              <View style={[styles.row, { borderBottomColor: colors.border }]}>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Recordatorios de eventos</Text>
                  <Text style={[styles.rowSub, { color: colors.icon }]}>
                    Recibe recordatorios antes de los eventos que hayas añadido a tu agenda personal.
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
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Tiempo de aviso</Text>
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
              <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Aviso de privacidad</Text>
              <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Esta aplicación funciona sin conexión a Internet y no recopila ningún dato
                  personal. Toda la
                  información guardada (agenda personal) se almacena exclusivamente en tu
                  dispositivo y nunca se transmite a ningún servidor.
                </Text>
              </View>
            </View>

            {/* Help & Support */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Ayuda y soporte</Text>
              <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Para cualquier problema técnico con la aplicación, contacta con el responsable informático de ASBTEC.
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
    fontSize: 16,
    fontFamily: OrbitronFonts.bold,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: OrbitronFonts.bold,
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
